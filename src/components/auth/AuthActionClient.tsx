"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { FirebaseError } from "firebase/app";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  At,
  Check,
  CheckCircle,
  Circle,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Key,
  LockKey,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { auth } from "@/lib/firebase";
import styles from "./AuthAction.module.css";

const DEFAULT_APP_URL = "https://planit-demo.web.app";
const CONFIGURED_APP_URL = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
const FIXED_SAFE_ORIGINS = new Set([
  "https://planit-hub.firebaseapp.com",
  "https://planit-demo.web.app",
]);

type SupportedMode = "resetPassword" | "verifyEmail" | "recoverEmail";
type ErrorMessageKey =
  | "expired"
  | "invalid"
  | "weakPassword"
  | "passwordRequirements"
  | "network"
  | "tooManyRequests"
  | "userDisabled"
  | "operationNotAllowed"
  | "service"
  | "unknownFirebase";

type PasswordValidationErrorKey =
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordMissingUppercase"
  | "passwordMissingLowercase"
  | "passwordMissingNumber";

type FormErrorKey =
  | ErrorMessageKey
  | PasswordValidationErrorKey
  | "passwordsMismatch";

type ErrorInfo<T extends string = ErrorMessageKey> = {
  key: T;
  code?: string;
};

type InitialActionResult =
  | { kind: "resetPassword"; email: string }
  | { kind: "verifyEmail" }
  | { kind: "recoverEmail"; email?: string; previousEmail?: string };

type Phase =
  | { kind: "loading" }
  | { kind: "resetForm"; email: string }
  | {
      kind: "success";
      action: SupportedMode;
      email?: string;
      previousEmail?: string;
    }
  | { kind: "error"; error: ErrorInfo };

type PasswordCriterion = {
  key: "length" | "uppercase" | "lowercase" | "number";
  passes: boolean;
};

type PasswordStrength = {
  width: "0%" | "30%" | "65%" | "100%";
  color: "transparent" | "#ef4444" | "#f59e0b" | "#10b981";
};

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;

function isSupportedMode(value: string | null): value is SupportedMode {
  return (
    value === "resetPassword" ||
    value === "verifyEmail" ||
    value === "recoverEmail"
  );
}

function getFirebaseErrorInfo(error: unknown): ErrorInfo {
  const code =
    error instanceof FirebaseError
      ? error.code
      : typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";

  switch (code) {
    case "auth/expired-action-code":
      return { key: "expired" };
    case "auth/invalid-action-code":
    case "auth/user-not-found":
      return { key: "invalid" };
    case "auth/weak-password":
      return { key: "weakPassword" };
    case "auth/password-does-not-meet-requirements":
      return { key: "passwordRequirements" };
    case "auth/network-request-failed":
      return { key: "network" };
    case "auth/too-many-requests":
      return { key: "tooManyRequests" };
    case "auth/user-disabled":
      return { key: "userDisabled" };
    case "auth/operation-not-allowed":
      return { key: "operationNotAllowed" };
    default:
      return code
        ? { key: "unknownFirebase", code }
        : { key: "service" };
  }
}

function getConfiguredAppUrl(): string {
  try {
    const url = new URL(CONFIGURED_APP_URL);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : DEFAULT_APP_URL;
  } catch {
    return DEFAULT_APP_URL;
  }
}

function isDevelopmentLocalhost(url: URL): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]"
  );
}

function resolveSafeContinueUrl(value: string | null): string {
  const fallback = getConfiguredAppUrl();

  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value);
    const currentOrigin =
      typeof window === "undefined" ? null : window.location.origin;
    const isHttp = url.protocol === "https:" || url.protocol === "http:";
    const isAllowedOrigin =
      FIXED_SAFE_ORIGINS.has(url.origin) ||
      url.origin === currentOrigin ||
      isDevelopmentLocalhost(url);

    return isHttp && isAllowedOrigin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function isAddPasswordAction(continueUrl: string | null): boolean {
  if (!continueUrl) {
    return false;
  }

  try {
    return (
      new URL(continueUrl).searchParams.get("passwordAction") === "addPassword"
    );
  } catch {
    return false;
  }
}

function getPasswordCriteria(password: string): PasswordCriterion[] {
  return [
    {
      key: "length",
      passes:
        password.length >= MIN_PASSWORD_LENGTH &&
        password.length <= MAX_PASSWORD_LENGTH,
    },
    { key: "uppercase", passes: /[A-Z]/.test(password) },
    { key: "lowercase", passes: /[a-z]/.test(password) },
    { key: "number", passes: /[0-9]/.test(password) },
  ];
}

function getPasswordValidationError(
  password: string,
): PasswordValidationErrorKey | null {
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordTooShort";
  if (password.length > MAX_PASSWORD_LENGTH) return "passwordTooLong";
  if (!/[A-Z]/.test(password)) return "passwordMissingUppercase";
  if (!/[a-z]/.test(password)) return "passwordMissingLowercase";
  if (!/[0-9]/.test(password)) return "passwordMissingNumber";

  return null;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { width: "0%", color: "transparent" };
  }

  const criteria = getPasswordCriteria(password);
  const meetsLength = criteria[0].passes;
  const hasUppercase = criteria[1].passes;
  const hasLowercase = criteria[2].passes;
  const hasNumber = criteria[3].passes;
  const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(password);
  let score = 0;

  if (password.length >= MIN_PASSWORD_LENGTH) score += 2;
  if (password.length >= 14) score += 1;
  if (hasLowercase) score += 1;
  if (hasUppercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecialCharacter) score += 1;

  if (!meetsLength || score <= 3) {
    return { width: "30%", color: "#ef4444" };
  }

  if (score <= 5) {
    return { width: "65%", color: "#f59e0b" };
  }

  return { width: "100%", color: "#10b981" };
}

async function runInitialAction(
  mode: SupportedMode,
  oobCode: string,
): Promise<InitialActionResult> {
  if (mode === "resetPassword") {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { kind: mode, email };
  }

  if (mode === "verifyEmail") {
    await applyActionCode(auth, oobCode);
    return { kind: mode };
  }

  const actionInfo = await checkActionCode(auth, oobCode);
  await applyActionCode(auth, oobCode);

  return {
    kind: mode,
    email: actionInfo.data.email ?? undefined,
    previousEmail: actionInfo.data.previousEmail ?? undefined,
  };
}

export function AuthActionClient() {
  const t = useTranslations("AuthAction");
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const modeParam = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const apiKey = searchParams.get("apiKey");
  const continueUrl = searchParams.get("continueUrl");
  const lang = searchParams.get("lang");
  const mode = isSupportedMode(modeParam) ? modeParam : null;
  const hasValidLink = Boolean(mode && oobCode);
  const addPassword = isAddPasswordAction(continueUrl);
  const safeContinueUrl = resolveSafeContinueUrl(continueUrl);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<ErrorInfo<FormErrorKey> | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const initialOperationRef = useRef<{
    key: string;
    promise: Promise<InitialActionResult>;
  } | null>(null);

  const passwordCriteria = useMemo(
    () => getPasswordCriteria(password),
    [password],
  );
  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );
  const passwordsMatch = password.length > 0 && password === confirmation;

  const strengthStyle = {
    "--strength-width": passwordStrength.width,
    "--strength-color": passwordStrength.color,
  } as CSSProperties;

  useEffect(() => {
    if (!mode || !oobCode) {
      return;
    }

    let active = true;
    const operationKey = `${mode}:${oobCode}:${apiKey ?? ""}:${lang ?? ""}:${retryNonce}`;

    if (initialOperationRef.current?.key !== operationKey) {
      initialOperationRef.current = {
        key: operationKey,
        promise: runInitialAction(mode, oobCode),
      };
    }

    initialOperationRef.current.promise
      .then((result) => {
        if (!active) return;

        if (result.kind === "resetPassword") {
          setPhase({ kind: "resetForm", email: result.email });
          return;
        }

        setPhase({
          kind: "success",
          action: result.kind,
          email: result.kind === "recoverEmail" ? result.email : undefined,
          previousEmail:
            result.kind === "recoverEmail" ? result.previousEmail : undefined,
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setPhase({ kind: "error", error: getFirebaseErrorInfo(error) });
        }
      });

    return () => {
      active = false;
    };
  }, [apiKey, lang, mode, oobCode, retryNonce]);

  function retryAction() {
    initialOperationRef.current = null;
    setPhase({ kind: "loading" });
    setFormError(null);
    setRetryNonce((value) => value + 1);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!oobCode || isSubmitting) return;

    const passwordValidationError = getPasswordValidationError(password);

    if (passwordValidationError) {
      setFormError({ key: passwordValidationError });
      return;
    }

    if (!passwordsMatch) {
      setFormError({ key: "passwordsMismatch" });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setPassword("");
      setConfirmation("");
      setPhase({ kind: "success", action: "resetPassword" });
    } catch (error: unknown) {
      const errorInfo = getFirebaseErrorInfo(error);

      if (errorInfo.key === "expired" || errorInfo.key === "invalid") {
        setPhase({ kind: "error", error: errorInfo });
      } else {
        setFormError(errorInfo);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const animationProps = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 18, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.99 },
        transition: {
          duration: 0.34,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  function renderInvalidState() {
    return (
      <motion.div key="invalid" {...animationProps} className={styles.state}>
        <div className={styles.iconBadge} data-tone="error">
          <WarningCircle weight="duotone" />
        </div>
        <p className={styles.eyebrow}>{t("invalid.eyebrow")}</p>
        <h1 className={styles.title}>{t("invalid.title")}</h1>
        <p className={styles.description}>{t("invalid.description")}</p>
        <a className={styles.primaryAction} href={safeContinueUrl}>
          {t("common.openPlanIt")}
          <ArrowRight weight="bold" />
        </a>
      </motion.div>
    );
  }

  function renderLoadingState() {
    const loadingKey =
      mode === "resetPassword"
        ? "loading.resetPassword"
        : mode === "verifyEmail"
          ? "loading.verifyEmail"
          : mode === "recoverEmail"
            ? "loading.recoverEmail"
            : "loading.generic";

    return (
      <motion.div
        key="loading"
        {...animationProps}
        className={styles.state}
        aria-live="polite"
        aria-busy="true"
      >
        <div className={styles.iconBadge}>
          <span className={styles.spinner} aria-hidden="true" />
        </div>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.title}>{t(loadingKey)}</h1>
        <p className={styles.description}>{t("loading.description")}</p>
      </motion.div>
    );
  }

  function renderResetForm(email: string) {
    return (
      <motion.div key="reset-form" {...animationProps} className={styles.state}>
        <div className={styles.iconBadge}>
          <LockKey weight="duotone" />
        </div>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.title}>
          {t(addPassword ? "reset.addTitle" : "reset.resetTitle")}
        </h1>
        <p className={styles.description}>
          {t(
            addPassword
              ? "reset.addDescription"
              : "reset.resetDescription",
          )}
        </p>

        <div className={styles.accountLine}>
          <At weight="bold" aria-hidden="true" />
          <span>{t("reset.accountLabel")}</span>
          <strong dir="ltr">{email}</strong>
        </div>

        <form className={styles.form} onSubmit={handlePasswordSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="new-password">{t("reset.passwordLabel")}</label>
            <div className={styles.inputShell}>
              <Key weight="duotone" aria-hidden="true" />
              <input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (formError) setFormError(null);
                }}
                autoComplete="new-password"
                spellCheck={false}
                aria-describedby="password-strength"
                required
              />
              <button
                type="button"
                className={styles.visibilityToggle}
                onClick={() => setShowPasswords((value) => !value)}
                aria-label={t(
                  showPasswords
                    ? "reset.hidePassword"
                    : "reset.showPassword",
                )}
                aria-pressed={showPasswords}
              >
                {showPasswords ? (
                  <EyeSlash weight="bold" />
                ) : (
                  <Eye weight="bold" />
                )}
              </button>
            </div>
          </div>

          <div className={styles.strengthBlock} id="password-strength">
            <div className={styles.strengthHeader}>
              <span>{t("reset.strengthLabel")}</span>
              <span>{t("reset.strengthHint")}</span>
            </div>
            <div
              className={styles.strengthTrack}
              role="progressbar"
              aria-label={t("reset.strengthLabel")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number.parseInt(passwordStrength.width, 10)}
              style={strengthStyle}
            >
              <span aria-hidden="true" />
            </div>
            <ul className={styles.criteriaList}>
              {passwordCriteria.map((criterion) => (
                <li key={criterion.key} data-passes={criterion.passes}>
                  {criterion.passes ? (
                    <CheckCircle weight="fill" aria-hidden="true" />
                  ) : (
                    <Circle weight="bold" aria-hidden="true" />
                  )}
                  {t(`reset.criteria.${criterion.key}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="confirm-password">{t("reset.confirmLabel")}</label>
            <div className={styles.inputShell}>
              <ShieldCheck weight="duotone" aria-hidden="true" />
              <input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value);
                  if (formError) setFormError(null);
                }}
                autoComplete="new-password"
                spellCheck={false}
                aria-invalid={confirmation.length > 0 && !passwordsMatch}
                aria-describedby="password-confirmation-message"
                required
              />
            </div>
            <p
              id="password-confirmation-message"
              className={styles.matchMessage}
              data-matches={passwordsMatch}
            >
              {confirmation.length > 0 ? (
                passwordsMatch ? (
                  <>
                    <Check weight="bold" aria-hidden="true" />
                    {t("reset.passwordsMatch")}
                  </>
                ) : (
                  t("reset.passwordsMismatch")
                )
              ) : (
                t("reset.confirmHint")
              )}
            </p>
          </div>

          {formError ? (
            <p className={styles.formError} role="alert">
              <WarningCircle weight="fill" aria-hidden="true" />
              {formError.key === "passwordsMismatch"
                ? t("reset.passwordsMismatch")
                : formError.key === "unknownFirebase"
                  ? t("errors.unknownFirebase", {
                      code: formError.code ?? "auth/unknown",
                    })
                  : t(`errors.${formError.key}`)}
            </p>
          ) : null}

          <button
            type="submit"
            className={styles.primaryAction}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("reset.submitting")
              : t(addPassword ? "reset.submitAdd" : "reset.submitReset")}
            {isSubmitting ? (
              <span className={styles.buttonSpinner} aria-hidden="true" />
            ) : (
              <ArrowRight weight="bold" aria-hidden="true" />
            )}
          </button>
        </form>
      </motion.div>
    );
  }

  function renderSuccessState(
    action: SupportedMode,
    email?: string,
    previousEmail?: string,
  ) {
    const isReset = action === "resetPassword";
    const title = isReset
      ? t(
          addPassword
            ? "reset.successAddTitle"
            : "reset.successResetTitle",
        )
      : t(`${action}.successTitle`);
    const description = isReset
      ? t(
          addPassword
            ? "reset.successAddDescription"
            : "reset.successResetDescription",
        )
      : action === "recoverEmail" && email
        ? t("recoverEmail.successDescriptionWithEmail", { email })
        : t(`${action}.successDescription`);

    return (
      <motion.div key="success" {...animationProps} className={styles.state}>
        <div className={styles.iconBadge} data-tone="success">
          <CheckCircle weight="duotone" />
        </div>
        <p className={styles.eyebrow}>{t("success.eyebrow")}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {action === "recoverEmail" && previousEmail ? (
          <div className={styles.accountLine}>
            <EnvelopeSimple weight="bold" aria-hidden="true" />
            <span>{t("recoverEmail.changedFrom")}</span>
            <strong dir="ltr">{previousEmail}</strong>
          </div>
        ) : null}
        <a className={styles.primaryAction} href={safeContinueUrl}>
          {t("common.openPlanIt")}
          <ArrowRight weight="bold" />
        </a>
      </motion.div>
    );
  }

  function renderErrorState(error: ErrorInfo) {
    const canRetry =
      error.key === "network" ||
      error.key === "service" ||
      error.key === "unknownFirebase";
    const errorMessage =
      error.key === "unknownFirebase"
        ? t("errors.unknownFirebase", {
            code: error.code ?? "auth/unknown",
          })
        : t(`errors.${error.key}`);

    return (
      <motion.div key="error" {...animationProps} className={styles.state}>
        <div className={styles.iconBadge} data-tone="error">
          <WarningCircle weight="duotone" />
        </div>
        <p className={styles.eyebrow}>{t("error.eyebrow")}</p>
        <h1 className={styles.title}>{t("error.title")}</h1>
        <p className={styles.description}>{errorMessage}</p>
        <div className={styles.actions}>
          {canRetry ? (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={retryAction}
            >
              {t("common.tryAgain")}
              <ArrowRight weight="bold" />
            </button>
          ) : null}
          <a
            className={
              canRetry ? styles.secondaryAction : styles.primaryAction
            }
            href={safeContinueUrl}
          >
            {t("common.openPlanIt")}
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <AnimatePresence mode="wait" initial={false}>
          {!hasValidLink
            ? renderInvalidState()
            : phase.kind === "loading"
              ? renderLoadingState()
              : phase.kind === "resetForm"
                ? renderResetForm(phase.email)
                : phase.kind === "success"
                  ? renderSuccessState(
                      phase.action,
                      phase.email,
                      phase.previousEmail,
                    )
                  : renderErrorState(phase.error)}
        </AnimatePresence>
      </div>
    </section>
  );
}
