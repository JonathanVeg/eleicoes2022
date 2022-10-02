import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Axios from "axios";

interface ICandidate {
  id: number;
  name: string;
  votes: number;
  percentage: number;
}

const Candidate: React.FC = ({ name, votes, percentage }: ICandidate) => {
  return (
    <CandidateWrapper>
      <Column>{name}</Column>
      <Column>{votes}</Column>
      <Column>{percentage}%</Column>
    </CandidateWrapper>
  );
};

const Home: React.FC = () => {
  const [data, setData] = useState<ICandidate[]>([]);
  const [updating, setUpdating] = useState(false);

  const getAndParseData = useCallback(async () => {
    setUpdating(true);
    const url = "https://resultados.tse.jus.br/oficial/ele2022/544/dados-simplificados/br/br-c0001-e000544-r.json";
    const { data } = await Axios.get(url);

    let { cand } = data;

    const newData: ICandidate[] = [];
    cand = cand.map((c: any, index: number) => {
      const { nm, vap, pvap } = c;
      newData.push({
        id: index,
        name: nm,
        votes: vap,
        percentage: pvap,
      });
    });

    setData(newData);

    setUpdating(false);
  }, []);

  useEffect(() => {
    getAndParseData();

    const interval = setInterval(() => {
      getAndParseData();
    }, 60000);

    return () => clearInterval(interval);
  }, [getAndParseData]);

  const usefulData = useMemo(() => {
    return data.filter((it) => parseFloat(it.percentage) > 2);
  }, [data]);

  return (
    <Container>
      <h1>Eleições 2022 {updating && "(atualizando...)"} </h1>
      <h2>Presidente</h2>
      {usefulData.map((candidate: ICandidate) => (
        <Candidate key={candidate.id} name={candidate.name} votes={candidate.votes} percentage={candidate.percentage} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1000px;
  padding: 0 1rem;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin: 1rem 0;
    align-self: center;
  }
`;

const CandidateWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`;

const Column = styled.div`
  width: 33%;
`;

export default Home;
