"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Igual ao useActionState, mas submete via onSubmit para o React NÃO resetar
 * o formulário: se der erro, o que a pessoa digitou continua na tela.
 * Passe `resetOnSuccess` para limpar o formulário só quando der certo.
 */
export function useFormAction<S extends { ok?: boolean }>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  { resetOnSuccess = false }: { resetOnSuccess?: boolean } = {},
) {
  type Payload = { data: FormData; form: HTMLFormElement };
  const [state, dispatch, pending] = useActionState<S, Payload>(async (prev: S, input: Payload) => {
    const next = await action(prev, input.data);
    if (resetOnSuccess && next.ok) input.form.reset();
    return next;
  }, initial as Awaited<S>);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(() => dispatch({ data, form }));
  }

  return [state, onSubmit, pending] as const;
}
