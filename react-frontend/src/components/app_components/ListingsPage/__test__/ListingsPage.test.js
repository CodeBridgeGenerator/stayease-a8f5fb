import React from "react";
import { render, screen } from "@testing-library/react";

import ListingsPage from "../ListingsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders listings page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <ListingsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("listings-datatable")).toBeInTheDocument();
    expect(screen.getByRole("listings-add-button")).toBeInTheDocument();
});
