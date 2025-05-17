import React from "react";
import { render, screen } from "@testing-library/react";

import ReviewsPage from "../ReviewsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders reviews page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <ReviewsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("reviews-datatable")).toBeInTheDocument();
    expect(screen.getByRole("reviews-add-button")).toBeInTheDocument();
});
