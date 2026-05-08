interface FieldErrorProps {
  message?: string | undefined;
}

/**
 * Inline error renderer for form fields. Renders nothing when there's
 * no message — keeps the field collapsed in the happy path.
 */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-400">
      {message}
    </p>
  );
}
