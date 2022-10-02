import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Axios from "axios";

interface ICandidate {
  id: number;
  name: string;
  votes: number;
  percentage: number;
}

const Candidate: React.FC<ICandidate> = ({ name, votes, percentage }: ICandidate) => {
  const readableVotes = useMemo(() => {
    return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [votes]);

  return (
    <CandidateWrapper>
      <Column>{name}</Column>
      <Column>{readableVotes} votos</Column>
      <Column>{percentage}%</Column>
    </CandidateWrapper>
  );
};

const Home: React.FC = () => {
  const [data, setData] = useState<ICandidate[]>([]);
  const [updating, setUpdating] = useState(false);
  const [percentage, setPercentage] = useState(0);

  const getAndParseData = useCallback(async () => {
    setUpdating(true);
    const url = "https://resultados.tse.jus.br/oficial/ele2022/544/dados-simplificados/br/br-c0001-e000544-r.json";
    const { data } = await Axios.get(url);

    let { cand, pesi } = data;

    setPercentage(pesi);

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
    return data.filter((it) => parseFloat(it.percentage) > 20);
  }, [data]);

  return (
    <>
      <Container>
        <Content>
          <h1>Eleições 2022 {updating && "(atualizando...)"} </h1>
          <h2>Presidente ({percentage}% apurado)</h2>
          {usefulData.map((candidate: ICandidate) => (
            <Candidate
              key={candidate.id}
              name={candidate.name}
              votes={candidate.votes}
              percentage={candidate.percentage}
            />
          ))}
        </Content>
        <Footer>
          <a href="https://github.com/JonathanVeg/eleicoes2022">Código no Github</a>
          <a href="https://twitter.com/JonathanVeg2">Twitter</a>
        </Footer>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  padding: 10px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  /* margin: 0 auto; */

  padding: 0 1rem;
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

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8rem;
  height: 50px;
  justify-content: space-between;
`;

export default Home;
