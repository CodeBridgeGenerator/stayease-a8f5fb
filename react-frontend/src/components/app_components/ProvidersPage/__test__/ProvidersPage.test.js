import React from "react";
import { render, screen } from "@testing-library/react";

import ProvidersPage from "../ProvidersPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders providers page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <ProvidersPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("providers-datatable")).toBeInTheDocument();
    expect(screen.getByRole("providers-add-button")).toBeInTheDocument();
});
