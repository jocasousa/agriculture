// src/pages/dashboard/index.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/api/api';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/navbar/Navbar';
import { CropData, LandUseData, LandUseDataRaw, StateData, Summary } from '@/types/dashboard';

const chartColors = ['#69eca3', '#1c7d47', '#82ca9d', '#8884d8'];

// --- Styled Components ---
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
  background: #f5f5f5;
  overflow-y: auto;
`;

const SummaryWrapper = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  flex: 1;
  text-align: center;
`;

const ChartsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ChartBlock = styled.div`
  width: 100%;
  height: 300px;
`;

// --- Componente ---
const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<Summary>({ totalFarms: 0, totalArea: 0 });
  const [byState, setByState] = useState<StateData[]>([]);
  const [byCrop, setByCrop] = useState<CropData[]>([]);
  const [byLandUse, setByLandUse] = useState<LandUseData[]>([]);

  const navigate = useNavigate();
  const isAuth = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuth) {
      navigate('/login', { replace: true });
      return;
    }
    const fetchData = async () => {
      try {
        const [sumRes, stateRes, cropRes, landRes] = await Promise.all([
          api.get<Summary>('/dashboard/summary'),
          api.get('/dashboard/by-state'),
          api.get('/dashboard/by-crop'),
          api.get<LandUseDataRaw>('/dashboard/land-use'),
        ]);
        setSummary(sumRes.data);

        setByState(
          Array.isArray(stateRes.data)
            ? stateRes.data.map((s: any) => ({
                name: s.state,
                value: s.count,
              }))
            : []
        );
        setByCrop(
          Array.isArray(cropRes.data)
            ? cropRes.data.map((c: any) => ({
                name: c.crop,
                value: c.count,
              }))
            : []
        );

        const landData: LandUseData[] = [
          { name: 'Agricultável', value: landRes.data.arable },
          { name: 'Vegetação', value: landRes.data.vegetation },
        ];
        setByLandUse(landData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard', error);
      }
    };
    fetchData();
  }, [isAuth, navigate]);

  return (
    <>
      <Navbar />
      <PageWrapper>
        <Header>
          <h1>Dashboard</h1>
        </Header>

        <Content>
          <SummaryWrapper>
            <SummaryCard>
              <h2>Fazendas</h2>
              <p>{summary.totalFarms}</p>
            </SummaryCard>
            <SummaryCard>
              <h2>Total Hectares</h2>
              <p>{summary.totalArea}</p>
            </SummaryCard>
          </SummaryWrapper>

          <ChartsWrapper>
            <ChartBlock>
              <h3>Por Estado</h3>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byState} dataKey="value" nameKey="name" outerRadius={100} label>
                    {byState.map((entry, idx) => (
                      <Cell key={entry.name} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBlock>

            <ChartBlock>
              <h3>Por Cultura</h3>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCrop} dataKey="value" nameKey="name" outerRadius={100} label>
                    {byCrop.map((entry, idx) => (
                      <Cell key={entry.name} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBlock>

            <ChartBlock>
              <h3>Uso do Solo</h3>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byLandUse} dataKey="value" nameKey="name" outerRadius={100} label>
                    {byLandUse.map((entry, idx) => (
                      <Cell key={entry.name} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBlock>
          </ChartsWrapper>
        </Content>
      </PageWrapper>
    </>
  );
};

export default DashboardPage;
