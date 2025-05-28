jest.mock('@/api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("@/components/navbar/Navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock("@/hooks/useAppSelector", () => ({
  useAppSelector: () => true,
}));

jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="piechart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../index";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { BrowserRouter } from "react-router-dom";
import api from "@/api/api";

const mockSummary = { totalFarms: 5, totalArea: 1200 };
const mockByState = [{ state: "SP", count: 3 }, { state: "PR", count: 2 }];
const mockByCrop = [{ crop: "Soja", count: 3 }, { crop: "Milho", count: 2 }];
const mockLandUse = { arable: 800, vegetation: 400 };

beforeAll(() => {
  (api.get as jest.Mock).mockImplementation((url: string) => {
    switch (url) {
      case "/dashboard/summary":
        return Promise.resolve({ data: mockSummary });
      case "/dashboard/by-state":
        return Promise.resolve({ data: mockByState });
      case "/dashboard/by-crop":
        return Promise.resolve({ data: mockByCrop });
      case "/dashboard/land-use":
        return Promise.resolve({ data: mockLandUse });
      default:
        return Promise.resolve({ data: {} });
    }
  });
});

describe("DashboardPage", () => {
  it("renderiza resumo e gráficos corretamente", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    // Espera carregar e renderizar o resumo
    await waitFor(() => {
      expect(screen.getByText("Fazendas")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Total Hectares")).toBeInTheDocument();
      expect(screen.getByText("1200")).toBeInTheDocument();
    });

    // Títulos dos gráficos
    expect(screen.getByText("Por Estado")).toBeInTheDocument();
    expect(screen.getByText("Por Cultura")).toBeInTheDocument();
    expect(screen.getByText("Uso do Solo")).toBeInTheDocument();

    // Os gráficos existem (mas não labels)
    expect(screen.getAllByTestId("piechart")).toHaveLength(3);
    expect(screen.getAllByTestId("pie")).toHaveLength(3);
    expect(screen.getAllByTestId("cell")).toHaveLength(6); // 2 cells por gráfico no mock
  });
});
