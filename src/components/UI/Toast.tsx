import { useEffect, useState } from "react";
import { useGrid } from "../../context/GridContext";
import styles from "./Toast.module.css";

/**
 * Toast Notification Component
 * Displays slide-up notifications at bottom-center of screen
 * Auto-dismisses after 3 seconds with exit animation
 */
const Toast = () => {
  const { toastMsg, clearToast } = useGrid();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toastMsg) {
      setIsExiting(false);
      return;
    }

    // Start exit animation after 2.7s, then clear after 3s total
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);

    const clearTimer = setTimeout(() => {
      clearToast();
      setIsExiting(false);
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(clearTimer);
    };
  }, [toastMsg, clearToast]);

  if (!toastMsg) return null;

  // Determine toast type based on message content
  const getToastType = (): "error" | "warning" | "success" | undefined => {
    if (
      toastMsg.toLowerCase().includes("unreachable") ||
      toastMsg.toLowerCase().includes("no path")
    ) {
      return "error";
    }
    if (toastMsg.toLowerCase().includes("warning")) {
      return "warning";
    }
    if (
      toastMsg.toLowerCase().includes("success") ||
      toastMsg.toLowerCase().includes("complete")
    ) {
      return "success";
    }
    return undefined;
  };

  const toastType = getToastType();

  // Icon based on type
  const getIcon = () => {
    switch (toastType) {
      case "error":
        return "⚠️";
      case "warning":
        return "⚡";
      case "success":
        return "✓";
      default:
        return "ℹ️";
    }
  };

  const toastClasses = [
    styles.toast,
    toastType ? styles[toastType] : "",
    isExiting ? styles.exiting : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.toastContainer}>
      <div className={toastClasses} role="alert" aria-live="polite">
        <span className={styles.icon}>{getIcon()}</span>
        <span className={styles.message}>{toastMsg}</span>
      </div>
    </div>
  );
};

export default Toast;
