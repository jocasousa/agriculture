import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import api from '@/api/api';
import { Navbar } from '@/components/navbar/Navbar';
import ProducerForm from './ProducerForm';
import { Producer } from '@/types/producer';
import { Cultivation } from '@/types/cultivation';
import { Farm } from '@/types/farm';



const FarmsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const FarmCard = styled.div`
  background: #f9fefc;
  border: 1px solid #e2f7e7;
  border-radius: 0.5rem;
  padding: 0.75rem 1.1rem;
  min-width: 220px;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(40,160,80,0.05);
  font-size: 0.96em;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1c7d47;
`;

const AddButton = styled.button`
  background: #69eca3;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1c7d47;
  }
`;

const TableWrapper = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TH = styled.th`
  height: 2.5rem;
  background: #f0f0f0;
  color: #555;
  font-weight: 500;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
`;

const TD = styled.td`
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: top;
`;

const Actions = styled.td`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
`;

const IconBtn = styled.button<{ color?: string }>`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ color }) => color || '#333'};
  display: flex;
  align-items: center;
  padding: 0.25rem;
  font-size: 1rem;
  &:hover {
    opacity: 0.7;
  }
`;

const ErrorMsg = styled.div`
  color: #d9534f;
  margin: 1rem 0;
  text-align: center;
`;

// ---- Modais ----
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 0.5rem;
  padding: 2rem;
  min-width: 340px;
  max-width: 98vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  position: relative;
`;
const ModalClose = styled.button`
  background: #1c7d47;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  &:hover { background: #145a38; }
`;



const ProducerPage: React.FC = () => {
    const [producers, setProducers] = useState<Producer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [openForm, setOpenForm] = useState(false);
    const [editProducer, setEditProducer] = useState<Producer | null>(null);
    const [viewProducer, setViewProducer] = useState<Producer | null>(null);
  
    const fetchProducers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<Producer[]>('/producers');
        // Para cada produtor, busca as fazendas dele
        const prodsWithFarms = await Promise.all(
          res.data.map(async (prod) => {
            // Busca fazendas desse produtor (não de todos)
            const farmsRes = await api.get<Farm[]>(`/farms?producerId=${prod.id}`);
            // Para cada fazenda, busca os cultivos dela
            const farmsWithCultivations = await Promise.all(
              farmsRes.data.map(async (farm) => {
                const cultivationsRes = await api.get<Cultivation[]>(`/cultivations?farmId=${farm.id}`);
                // Corrige caso cultivos não venham com season, exibe como array vazio se não vier
                const cultivations = Array.isArray(cultivationsRes.data)
                  ? cultivationsRes.data.map(cult => ({
                      ...cult,
                      season: cult.season || undefined,
                    }))
                  : [];
                return { ...farm, cultivations };
              })
            );
            return { ...prod, farms: farmsWithCultivations };
          })
        );
        setProducers(prodsWithFarms);
      } catch (err: any) {
        setError('Erro ao carregar produtores');
      }
      setLoading(false);
    };
  
    useEffect(() => {
      fetchProducers();
    }, []);
  
    const handleDelete = async (id: string) => {
      if (!window.confirm('Deseja excluir este produtor?')) return;
      try {
        await api.delete(`/producers/${id}`);
        fetchProducers();
      } catch (err: any) {
        setError('Erro ao excluir produtor');
      }
    };
  
    // Modal Visualizar (exibe corretamente culturas)
    const renderViewModal = () =>
      viewProducer && (
        <ModalOverlay>
          <ModalContent>
            <h2>Visualizar Produtor</h2>
            <div>
              <strong>Nome:</strong> {viewProducer.name}<br />
              <strong>CPF/CNPJ:</strong> {viewProducer.document}<br />
              <strong>Fazendas:</strong>
              <ul>
                {viewProducer.farms.length === 0 ? (
                  <li>Nenhuma fazenda cadastrada</li>
                ) : (
                  viewProducer.farms.map(farm => (
                    <li key={farm.id} style={{ marginBottom: 12 }}>
                      <b>{farm.name}</b> — {farm.city}/{farm.state}<br />
                      Área total: {farm.totalArea} ha, Agricultável: {farm.arableArea} ha, Vegetação: {farm.vegetationArea} ha
                      <br />
                      <b>Culturas:</b>
                      {farm.cultivations && farm.cultivations.length > 0 ? (
                        <ul>
                          {farm.cultivations.map(cult =>
                            <li key={cult.id}>
                              {cult.crop} {cult.season && `(Safra ${cult.season.year})`}
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span> Nenhuma cultura</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <ModalClose onClick={() => setViewProducer(null)}>Fechar</ModalClose>
          </ModalContent>
        </ModalOverlay>
      );
  
    return (
      <>
        <Navbar />
        <PageWrapper>
          <Header>
            <Title>Produtores</Title>
            <AddButton onClick={() => { setEditProducer(null); setOpenForm(true); }}>
              <Plus size={20} /> Adicionar
            </AddButton>
          </Header>
  
          <TableWrapper>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <Table>
              <thead>
                <tr>
                  <TH>Nome</TH>
                  <TH>CPF/CNPJ</TH>
                  <TH>Fazendas</TH>
                  <TH>Ações</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><TD colSpan={4}>Carregando...</TD></tr>
                ) : producers.length === 0 ? (
                  <tr><TD colSpan={4}>Nenhum produtor encontrado</TD></tr>
                ) : (
                  producers.map(prod => (
                    <tr key={prod.id}>
                      <TD>{prod.name}</TD>
                      <TD>{prod.document}</TD>
                      <TD>
  {prod.farms.length === 0
    ? 'Nenhuma fazenda'
    : (
      <FarmsRow>
        {prod.farms.map(farm => (
          <FarmCard key={farm.id}>
            <b>{farm.name}</b> <span style={{ color: '#888' }}>({farm.city}/{farm.state})</span><br />
            <span>Área: {farm.totalArea}ha, Agri: {farm.arableArea}ha, Veg: {farm.vegetationArea}ha</span>
            <br />
            <b>Culturas:</b>
            {farm.cultivations && farm.cultivations.length > 0 ? (
              <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                {farm.cultivations.map(cult => (
                  <li key={cult.id} style={{ fontSize: '0.95em' }}>
                    {cult.crop} {cult.season && `(Safra ${cult.season.year})`}
                  </li>
                ))}
              </ul>
            ) : (
              <span> Nenhuma cultura</span>
            )}
          </FarmCard>
        ))}
      </FarmsRow>
    )
  }
</TD>
                      <Actions>
                        <IconBtn color="#0d6efd" title="Visualizar" onClick={() => setViewProducer(prod)}>
                          <Eye size={18} />
                        </IconBtn>
                        <IconBtn color="#1c7d47" title="Editar" onClick={() => {
                          setEditProducer(prod);
                          setOpenForm(true);
                        }}>
                          <Pencil size={18} />
                        </IconBtn>
                        <IconBtn color="#dc3545" title="Excluir" onClick={() => handleDelete(prod.id)}>
                          <Trash2 size={18} />
                        </IconBtn>
                      </Actions>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
          {openForm &&
            <ProducerForm
              producer={editProducer}
              onClose={() => setOpenForm(false)}
              onSaved={() => { setOpenForm(false); fetchProducers(); }}
            />
          }
          {renderViewModal()}
        </PageWrapper>
      </>
    );
  };
  
  export default ProducerPage;