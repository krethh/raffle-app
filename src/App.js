import boxLogo from './box_logo.png'
import styled from 'styled-components';
import { FileUploader } from "react-drag-drop-files";
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Papa from 'papaparse';
import Confetti from 'react-confetti';

const MainContainer = styled.div`
  padding: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const BoxLogo = styled.img`
  max-height: 200px;
  max-width: 200px;
  margin-bottom: 50px;
`

const HeaderText = styled.span`
  font-size: large;
  margin-bottom: 15px;
  font-family: 'Lato', sans-serif;
  font-size: 48px;
`

const Board = styled.div`
  width: 1200px;
  height: 600px;
  flex-wrap: wrap;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(100, 40px);
`

const Square = styled.div`
  height: 3px;
  width: 3px;
  margin-right: 0px;
  padding: 0px;
`

const Frame = styled.div`
  border: 1px solid;
  font-size: 16px;
  height: 30px;
  width: 250px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Lato', sans-serif;
  align-self: center;
`

const BoxButton = styled.button`
    -webkit-font-smoothing: antialiased;
    text-align: center;
    box-sizing: border-box;
    margin: 0;
    outline: 0 none;
    vertical-align: baseline;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-family: 'Lato',sans-serif;
    padding: 1rem 2.5rem;
    border: none;
    border-radius: 6px;
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1;
    background: #2486FC;
    color: #fff;
    display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
`

const TheWinnerIs = styled.p`
  font-size: 24px;
  font-family: 'Lato', sans-serif;
`

function getColor() {
  var letters = 'ABCDEF0123456789';
  var output = '';
  for (let i = 0; i < 6; i++) {
    output += letters[Math.floor(Math.random() * 16)];
  }
  return output;
}

const wait = async (time) => { await new Promise(r => setTimeout(r, time)) };

const Participant = ({ participant }) => {
  const { name, color, points } = participant;

  var rgb = parseInt(color, 16);   // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff;  // extract red
  var g = (rgb >> 8) & 0xff;  // extract green
  var b = (rgb >> 0) & 0xff;  // extract blue

  return (
    <Frame style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`, color: 'black', fontWeight: "bold"}}>
      {name} - {points}
    </Frame>)
}

function App() {
  const [participants, setParticipants] = useState([])
  const [drawComplete, setDrawComplete] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [lots, setLots] = useState([]);

  const handleFileUpload = async (file) => {
    const text = await file.text();
    const parsed = Papa.parse(text).data;
    const participants = parsed.map((row, index) => ({
      name: row[1],
      points: Number(row[0]),
      color: getColor()
    }))

    setParticipants(participants);
    const entries = [];
    participants.forEach(participant => {
      for (let i = 0; i < participant.points; i++) {
        entries.push({ participant, lotNumber: i })
      }
    })

    setLots(entries);

    setStage(1);
    wait(100);
    setStage(2);
  };

  const startDraw = async () => {
    setDrawComplete(false);

    let nextLots = lots;

    if (currentWinner) {
      nextLots = lots.filter(it => it.participant !== currentWinner);
      setLots(nextLots)
    }

    for (let i = 0; i < 10; i++) {
      await wait(100);
      const randomLot = nextLots[nextLots.length * Math.random() | 0]
      setCurrentWinner(randomLot.participant)
    }
    for (let i = 0; i < 6; i++) {
      await wait(500);
      const randomLot = nextLots[nextLots.length * Math.random() | 0]
      setCurrentWinner(randomLot.participant)
    }
    for (let i = 0; i < 3; i++) {
      await wait(1000);
      const randomLot = nextLots[nextLots.length * Math.random() | 0]
      setCurrentWinner(randomLot.participant)
    }
    for (let i = 0; i < 2; i++) {
      await wait(1500);
      const randomLot = nextLots[nextLots.length * Math.random() | 0]
      setCurrentWinner(randomLot.participant)
    }
    setDrawComplete(true);
  }

  const [stage, setStage] = useState(0);

  return (
    <MainContainer>
      <BoxLogo src={boxLogo} />
      <HeaderText>
        Advanced Prize Raffle Tool
      </HeaderText>
      {stage == 0 && (
        <>
          <FileUploader handleChange={handleFileUpload} name="file" types={["CSV"]} />
        </>
      )}
      {stage == 1 && <CircularProgress size={100} />}
      {stage == 2 &&
        <>
          <BoxButton onClick={startDraw}>Let's roll {currentWinner ? 'again' : ''}!</BoxButton>
          {currentWinner && (
            <>
              {drawComplete && (
                <>
                  <Confetti />
                  <TheWinnerIs>The winner is: </TheWinnerIs>
                </>
              )}
              {!drawComplete && (
                <TheWinnerIs>Draw in progress...</TheWinnerIs>
              )}
              <Participant participant={currentWinner} />
            </>
          )}
          <Board>
            {participants.map(participant => <Participant participant={participant} />)}
          </Board>
        </>
      }
    </MainContainer>
  );
}

export default App;
