import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/api/api';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Plus, Trash2 } from 'lucide-react';

// --- Validação
const cpfCnpjRegex = /^(\d{11}|\d{14})$/;
const CultivationSchema = z.object({
  id: z.string().optional(),
  crop: z.string().min(1, "Cultura obrigatória"),
  seasonYear: z.coerce.number().min(2000, "Ano inválido"),
});
const FarmSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  totalArea: z.coerce.number().min(0.1, "Total deve ser > 0"),
  arableArea: z.coerce.number().min(0, "Mínimo 0"),
  vegetationArea: z.coerce.number().min(0, "Mínimo 0"),
  cultivations: z.array(CultivationSchema).default([]),
}).superRefine((data, ctx) => {
  if ((data.arableArea + data.vegetationArea) > data.totalArea) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Soma das áreas excede total.",
      path: ['arableArea'],
    });
  }
});
const FormSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  document: z.string().regex(cpfCnpjRegex, "CPF/CNPJ deve ter 11 ou 14 dígitos"),
  farms: z.array(FarmSchema),
});
type FormValues = z.infer<typeof FormSchema>;

type Props = {
  producer?: any;
  onClose: () => void;
  onSaved: () => void;
};

function normalizeCultivations(arr: any) {
  return Array.isArray(arr)
    ? arr.map((c: any) => ({
        id: c.id,
        crop: c.crop,
        seasonYear: c.season?.year ?? c.seasonYear,
      }))
    : [];
}

function normalizeFarm(f: any) {
  return {
    id: f.id,
    name: f.name,
    city: f.city,
    state: f.state,
    totalArea: f.totalArea,
    arableArea: f.arableArea,
    vegetationArea: f.vegetationArea,
    cultivations: normalizeCultivations(f.cultivations),
  };
}

const ProducerForm: React.FC<Props> = ({ producer, onClose, onSaved }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as any, // workaround TS resolver mismatch
    defaultValues: producer
      ? {
          name: producer.name,
          document: producer.document,
          farms: Array.isArray(producer.farms)
            ? producer.farms.map(normalizeFarm)
            : [],
        }
      : { name: '', document: '', farms: [] },
  });

  const { fields: farmFields, append: appendFarm, remove: removeFarm } = useFieldArray({
    control,
    name: "farms",
  });

  useEffect(() => {
    if (producer) {
      reset({
        name: producer.name,
        document: producer.document,
        farms: Array.isArray(producer.farms)
          ? producer.farms.map(normalizeFarm)
          : [],
      });
    } else {
      reset({ name: '', document: '', farms: [] });
    }
    // eslint-disable-next-line
  }, [producer]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      let prodId = producer?.id;
      if (!producer) {
        const res = await api.post('/producers', {
          name: data.name,
          document: data.document,
        });
        prodId = res.data.id;
      } else {
        await api.patch(`/producers/${producer.id}`, {
          name: data.name,
          document: data.document,
        });
      }
      // Remover fazendas excluídas (se edição)
      if (producer && producer.farms) {
        const removedFarms = producer.farms.filter((f: any) =>
          !data.farms?.find((nf) => nf.id === f.id)
        );
        for (const f of removedFarms) {
          await api.delete(`/farms/${f.id}`);
        }
      }
      // Salvar/atualizar fazendas e cultivos
      for (const [idx, farm] of (data.farms || []).entries()) {
        const { id: farmIdToRemove, cultivations, ...farmData } = farm;
        if (!farm.id) {
          const newFarm = await api.post('/farms', { ...farmData, producerId: prodId });
          data.farms![idx].id = newFarm.data.id;
        } else {
          await api.patch(`/farms/${farm.id}`, { ...farmData, producerId: prodId });
        }
        const farmOrig = producer?.farms?.find((f: any) => f.id === farm.id);
        if (farmOrig) {
          const removedCult = (farmOrig.cultivations || []).filter((c: any) =>
            !farm.cultivations?.find((nc) => nc.id === c.id)
          );
          for (const cult of removedCult) {
            await api.delete(`/cultivations/${cult.id}`);
          }
        }
        for (const [cidx, cult] of (farm.cultivations || []).entries()) {
          let seasonId: string | null = null;
          const seasonYear = cult.seasonYear;
          const seasons = await api.get('/seasons');
          const matchSeason = (seasons.data as any[]).find(s => s.year === seasonYear);
          if (matchSeason) {
            seasonId = matchSeason.id;
          } else {
            const newS = await api.post('/seasons', { year: seasonYear });
            seasonId = newS.data.id;
          }
          const { id: cultIdToRemove, seasonYear: seasonYearToRemove, ...cultivationData } = cult;
          if (!cult.id) {
            const newCult = await api.post('/cultivations', {
              ...cultivationData,
              farmId: data.farms![idx].id,
              seasonId,
            });
            data.farms![idx].cultivations![cidx].id = newCult.data.id;
          } else {
            await api.patch(`/cultivations/${cult.id}`, {
              ...cultivationData,
              seasonId,
            });
          }
        }
      }
      onSaved();
    } catch (e: any) {
      alert('Erro ao salvar: ' + (e?.response?.data?.message || e.message));
    }
  };

  return (
    <FormModal>
      <FormBox onSubmit={handleSubmit(onSubmit)}>
        <CloseBtn type="button" onClick={onClose}>Fechar</CloseBtn>
        <h2>{producer ? 'Editar Produtor' : 'Novo Produtor'}</h2>
        <Input label="Nome do produtor" {...register('name')} error={errors.name?.message} />
        <Input label="CPF ou CNPJ" {...register('document')} error={errors.document?.message} />

        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>Fazendas</b>
            <Button type="button" onClick={() => appendFarm({
              name: '',
              city: '',
              state: '',
              totalArea: 1,
              arableArea: 0,
              vegetationArea: 0,
              cultivations: [],
            })}>
              <Plus size={16} /> Adicionar fazenda
            </Button>
          </div>
          {farmFields.length === 0 && <div style={{ color: '#aaa', margin: 8 }}>Nenhuma fazenda adicionada</div>}
          {farmFields.map((farm, idx) => (
            <FarmItem
              key={farm.id || idx}
              nestIndex={idx}
              control={control}
              register={register}
              errors={errors}
              removeFarm={removeFarm}
            />
          ))}
        </Section>

        <Button type="submit" disabled={isSubmitting}>{producer ? 'Salvar' : 'Cadastrar'}</Button>
      </FormBox>
    </FormModal>
  );
};

export default ProducerForm;

const FarmBlock = styled.div`
  border: 1px solid #d7fbe1;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f7fffa;
`;

const CultivationBlock = styled.div`
  background: #fff;
  border-radius: 5px;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #69eca3;
`;

const ErrorMsg = styled.div`
  color: #d9534f;
  margin: 0.5rem 0;
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
`;

function FarmItem({ nestIndex, control, register, errors, removeFarm }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `farms.${nestIndex}.cultivations`,
  });

  return (
    <FarmBlock>
      <Row>
        <Input label="Nome" {...register(`farms.${nestIndex}.name`)} error={errors?.farms?.[nestIndex]?.name?.message} />
        <Input label="Cidade" {...register(`farms.${nestIndex}.city`)} error={errors?.farms?.[nestIndex]?.city?.message} />
        <Input label="UF" maxLength={2} {...register(`farms.${nestIndex}.state`)} error={errors?.farms?.[nestIndex]?.state?.message} />
      </Row>
      <Row>
        <Input label="Área Total (ha)" type="number" step={0.1} {...register(`farms.${nestIndex}.totalArea`)} error={errors?.farms?.[nestIndex]?.totalArea?.message} />
        <Input label="Agricultável (ha)" type="number" step={0.1} {...register(`farms.${nestIndex}.arableArea`)} error={errors?.farms?.[nestIndex]?.arableArea?.message} />
        <Input label="Vegetação (ha)" type="number" step={0.1} {...register(`farms.${nestIndex}.vegetationArea`)} error={errors?.farms?.[nestIndex]?.vegetationArea?.message} />
      </Row>
      {errors?.farms?.[nestIndex]?.root && (
        <ErrorMsg>{errors?.farms?.[nestIndex]?.root?.message}</ErrorMsg>
      )}
      <Section>
        <b>Culturas Plantadas</b>
        <Button type="button" onClick={() => append({ crop: '', seasonYear: new Date().getFullYear() })}>
          <Plus size={14} /> Adicionar cultura
        </Button>
        {fields.length === 0 &&
          <div style={{ color: '#aaa', margin: 8 }}>Nenhuma cultura</div>}
        {fields.map((cult, cidx) => (
          <CultivationBlock key={cult.id || cidx}>
            <Row>
              <Input label="Cultura" {...register(`farms.${nestIndex}.cultivations.${cidx}.crop`)} error={errors?.farms?.[nestIndex]?.cultivations?.[cidx]?.crop?.message} />
              <Input label="Safra (ano)" type="number" {...register(`farms.${nestIndex}.cultivations.${cidx}.seasonYear`)} error={errors?.farms?.[nestIndex]?.cultivations?.[cidx]?.seasonYear?.message} />
              <IconBtn type="button" title="Remover cultura" onClick={() => remove(cidx)}>
                <Trash2 size={16} />
              </IconBtn>
            </Row>
          </CultivationBlock>
        ))}
      </Section>
      <Button variant="secondary" type="button" style={{ marginTop: 12 }} onClick={() => removeFarm(nestIndex)}>
        Remover fazenda
      </Button>
    </FarmBlock>
  );
}

const FormModal = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.25);
  display: flex; align-items: center; justify-content: center; z-index:1001;
`;
const FormBox = styled.form`
  background: #fff;
  border-radius: 0.5rem;
  min-width: 380px;
  max-width: 98vw;
  max-height: 90vh;
  padding: 2rem 2rem 1rem 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow-y: auto;
`;
const CloseBtn = styled.button`
  background: #1c7d47; color:#fff; border: none; border-radius: 0.25rem;
  padding: 0.35rem 1rem; position:absolute; right:16px; top:12px; font-weight:600;
  cursor: pointer;
`;
const Section = styled.div`
  margin-top: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
`;
const IconBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #333;
  margin-left: 4px;
  display: flex;
  align-items: center;
  &:hover { color: #dc3545; }
`;
