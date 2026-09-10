// @vitest-environment jsdom
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyDeletionDialog } from "./PropertyDeletionDialog";

afterEach(cleanup);

describe("PropertyDeletionDialog", () => {
  it("percorre as duas confirmações e só libera a exclusão com o nome exato", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<PropertyDeletionDialog open propertyName="Fazenda Santa Clara" pending={false} onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole("heading", { name: "Excluir esta área?" })).toBeTruthy();
    await user.click(screen.getByTestId("advance-delete"));
    expect(screen.getByRole("heading", { name: "Atenção: exclusão permanente" })).toBeTruthy();

    const confirmButton = screen.getByTestId("confirm-delete") as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Nome exato da área"), { target: { value: "nome diferente" } });
    expect(confirmButton.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Nome exato da área"), { target: { value: " fazenda santa clara " } });
    expect(confirmButton.disabled).toBe(false);
    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith(" fazenda santa clara ");
  });

  it("cancela sem confirmar a exclusão", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<PropertyDeletionDialog open propertyName="Fazenda Santa Clara" pending={false} onCancel={onCancel} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
