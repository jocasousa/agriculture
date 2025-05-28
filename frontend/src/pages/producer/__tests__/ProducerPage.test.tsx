jest.mock('@/api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/components/navbar/Navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock("@/hooks/useAppSelector", () => ({
  useAppSelector: () => true,
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProducerPage from "../index";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { BrowserRouter } from "react-router-dom";
import api from "@/api/api";

const mockProducers: any[] = [];

beforeEach(() => {
  jest.clearAllMocks();

  (api.get as jest.Mock).mockImplementation((url: string) => {
    if (url === "/producers") return Promise.resolve({ data: mockProducers });
    if (url.startsWith("/farms?producerId=")) return Promise.resolve({ data: [] });
    if (url.startsWith("/cultivations?farmId=")) return Promise.resolve({ data: [] });
    if (url === "/seasons") return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });

  (api.post as jest.Mock).mockImplementation((url: string, data: any) => {
    if (url === "/producers") {
      // Apenas para garantir limpeza de array entre execuções:
      mockProducers.length = 0;
      // O producer terá farms no mock, mas o frontend não usa isso ao renderizar logo após cadastro
      mockProducers.push({
        ...data,
        id: "1",
        farms: [
          {
            id: "101",
            name: "Fazenda Teste",
            city: "Maringá",
            state: "PR",
            totalArea: 100,
            arableArea: 60,
            vegetationArea: 40,
            cultivations: [
              {
                id: "c1",
                crop: "Soja",
                seasonYear: 2025,
              }
            ]
          }
        ]
      });
      return Promise.resolve({ data: { id: "1" } });
    }
    if (url === "/farms") {
      return Promise.resolve({ data: { id: "101" } });
    }
    if (url === "/seasons") {
      return Promise.resolve({ data: { id: "s1" } });
    }
    if (url === "/cultivations") {
      return Promise.resolve({ data: { id: "c1" } });
    }
    return Promise.resolve({ data: { id: "any" } });
  });

  (api.patch as jest.Mock).mockResolvedValue({});
  (api.delete as jest.Mock).mockResolvedValue({});
});

describe("ProducerPage - cadastro de produtor", () => {
  it("cadastra novo produtor e visualiza no modal (deve mostrar Nenhuma fazenda cadastrada)", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProducerPage />
        </BrowserRouter>
      </Provider>
    );

    // Abre modal de cadastro
    fireEvent.click(screen.getByText(/adicionar/i));

    // Preenche nome e documento
    let textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], { target: { value: "Joca" } });
    fireEvent.change(textboxes[1], { target: { value: "12345678901" } });

    // Adiciona fazenda
    fireEvent.click(screen.getByText(/adicionar fazenda/i));

    await waitFor(() => {
      const allTextboxes = screen.getAllByRole("textbox");
      const allSpinbuttons = screen.getAllByRole("spinbutton");
      fireEvent.change(
        allTextboxes.find(inp => (inp as HTMLInputElement).name === "farms.0.name")!,
        { target: { value: "Fazenda Teste" } }
      );
      fireEvent.change(
        allTextboxes.find(inp => (inp as HTMLInputElement).name === "farms.0.city")!,
        { target: { value: "Maringá" } }
      );
      fireEvent.change(
        allTextboxes.find(inp => (inp as HTMLInputElement).name === "farms.0.state")!,
        { target: { value: "PR" } }
      );
      fireEvent.change(
        allSpinbuttons.find(inp => (inp as HTMLInputElement).name === "farms.0.totalArea")!,
        { target: { value: "100" } }
      );
      fireEvent.change(
        allSpinbuttons.find(inp => (inp as HTMLInputElement).name === "farms.0.arableArea")!,
        { target: { value: "60" } }
      );
      fireEvent.change(
        allSpinbuttons.find(inp => (inp as HTMLInputElement).name === "farms.0.vegetationArea")!,
        { target: { value: "40" } }
      );
    });
    

    // Adiciona cultura
    fireEvent.click(screen.getByText(/adicionar cultura/i));
    await waitFor(() => {
      const cultTextboxes = screen.getAllByRole("textbox");
      const cultSpinbuttons = screen.getAllByRole("spinbutton");
      fireEvent.change(
        cultTextboxes.find(inp => (inp as HTMLInputElement).name === "farms.0.cultivations.0.crop")!,
        { target: { value: "Soja" } }
      );
      fireEvent.change(
        cultSpinbuttons.find(inp => (inp as HTMLInputElement).name === "farms.0.cultivations.0.seasonYear")!,
        { target: { value: "2025" } }
      );
    });

    // Cadastra
    fireEvent.click(screen.getByText(/cadastrar/i));

    // Produtor aparece na tabela
    await waitFor(() => {
      expect(screen.getByText("Joca")).toBeInTheDocument();
      expect(screen.getByText("12345678901")).toBeInTheDocument();
    });

    // Abre modal de visualização (botão "Visualizar" na linha do produtor)
    const visualizarBtn = screen.getAllByRole("button").find(btn => btn.getAttribute("title")?.toLowerCase() === "visualizar");
    expect(visualizarBtn).toBeTruthy();
    fireEvent.click(visualizarBtn!);

    // Espera o modal e verifica que mostra Nenhuma fazenda cadastrada (comportamento do seu front real)
    await waitFor(() => {
      expect(screen.getByText("Nenhuma fazenda cadastrada")).toBeInTheDocument();
    });
  });
});
