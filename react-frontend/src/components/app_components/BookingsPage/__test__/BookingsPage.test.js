import React from "react";
import { render, screen } from "@testing-library/react";

import BookingsPage from "../BookingsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders bookings page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <BookingsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("bookings-datatable")).toBeInTheDocument();
    expect(screen.getByRole("bookings-add-button")).toBeInTheDocument();
});
