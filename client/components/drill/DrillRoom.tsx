import {
    useMantineColorScheme,
    Center,
    Group,
    Button,
    Text,
    Box,
    Space,
    Container,
    ActionIcon
  } from '@mantine/core';
  import ColorSchemeToggle from '@/components/ColorSchemeToggle/ColorSchemeToggle';
  import HomeButton from '@/components/HomeButton';
  import SettingsButton from '@/components/SettingsButton';
  import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
  import WanakanaInput from '@/components/wanakanaInput';
  import { isKana } from 'wanakana';
  import { shuffled } from '@/lib/utils/array';
  import { useRouter } from 'next/router';
  import { optimalStringAlignmentDistance } from '@/lib/utils/string';
  import { useInputState } from '@mantine/hooks';
  import { useStopwatch } from 'react-timer-hook';
  // import { HomeIcon, ResetIcon } from '@modulz/radix-icons';
  import { IconHome, IconRotate, IconPlayerPlay } from '@tabler/icons';
  import { DrillDataInterface } from '@/interfaces/drill/DrillDataInterface';
  import { DrillType } from '@/interfaces/drill/DrillType';
  import DrillQuestionInterface from '@/interfaces/drill/DrillQuestionInterface';
  import ProgressBar from '@/components/drill/ProgressBar';
  import DrillInput from '@/components/drill/DrillInput';
  import { Howl } from 'howler';
  import useSound from 'use-sound';
  
  const MEDIA_PREFIX = 'https://immersionkit.ap-south-1.linodeobjects.com/jp_exercises/audio/';

  type DrillRoomProps = {
    data: DrillDataInterface[];
    quizType: DrillType;
  };

  export default function DrillRoom({data, quizType}: DrillRoomProps) {
    const router = useRouter();
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [inputValue, setInputValue] = useInputState<string>('');
    const [wrongAnswerList, setWrongAnswerList] = useState<string[]>([]);
    const [questionList, setQuestionList] = useState<DrillQuestionInterface[]>([]);
    const [inputStatus, setInputStatus] = useState<string>('input');
    const [shake, setShake] = useState<boolean>(false);
    const { seconds, minutes, hours, days, isRunning, start, pause, reset } = useStopwatch({
      autoStart: false,
    });
    
    const setupDrill = () => {
      setInputStatus('input');
      let questions = [];
      if (quizType === DrillType.ReadingAndMeaning) {
        questions = shuffled([
          ...getQuestions(data, DrillType.Reading),
          ...getQuestions(data, DrillType.Meaning),
        ]);
      } else if (quizType === DrillType.Reading) {
        questions = shuffled([...getQuestions(data, DrillType.Reading)]);
      } else if (quizType === DrillType.Meaning) {
        questions = shuffled([...getQuestions(data, DrillType.Meaning)]);
      } else if (quizType === DrillType.Audio) {
        questions = shuffled([...getQuestions(data, DrillType.Audio)]);
      }
      setQuestionList(questions);
      reset();
      setWrongAnswerList([]);
    };
  
    const getQuestions = (
      data: DrillDataInterface[],
      questionType: DrillType
    ): DrillQuestionInterface[] => {
      return [...data].map((q: DrillDataInterface) => {
        return {
          questionData: q,
          questionType: questionType,
        };
      });
    };
  
    useEffect(() => {
        setTotalQuestions(data.length);
        setupDrill();
    }, [data, quizType]);
  
    useEffect(()=>{
      if (questionList.length > 0) {
        if (quizType === DrillType.Audio){
          setupNewQuestion();
        }
      }
    }, [questionList])

    const activeQuestion = questionList[0];
  
    const isCorrect = (value: string, questionData: DrillQuestionInterface) => {
      if (questionData.questionType === DrillType.Reading) {
        return value === questionData.questionData.reading;
      } else if ([DrillType.Meaning, DrillType.Audio].includes(questionData?.questionType)) {
        if (questionData.questionData.definitions.includes(value)) {
          return true;
        } else {
          return questionData.questionData.definitions.some(
            (definition) => optimalStringAlignmentDistance(definition, value) <= 2
          );
        }
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        if (inputStatus === 'input' && isCorrect(inputValue, activeQuestion)) {
          setInputStatus('correct');
        } else if (inputStatus === 'correct') {
          if (questionList.length === 1) {
            pause();
            setInputStatus('complete');
          } else {
            setInputStatus('input');
          }
          setInputValue('');
          setQuestionList(questionList.splice(1));
        } else if (inputStatus === 'incorrect') {
          setInputStatus('input');
          setInputValue('');
          setQuestionList([...shuffled(questionList)]);
          if (!wrongAnswerList.includes(activeQuestion.questionData!.term)) {
            wrongAnswerList.push(activeQuestion.questionData!.term);
          }
        } else if (!isKana(inputValue) && activeQuestion?.questionType === DrillType.Reading) {
          shakeInput();
        } else {
          setInputStatus('incorrect');
        }
      }
    };
  
    const shakeInput = () => {
      setShake(true);
      setTimeout(() => setShake(false), 750);
    };
  
    if (questionList.length === 0 && inputStatus === 'complete') {
      const totalMinutes = minutes + days * 24 * 60 + hours * 6;
      const minuteString = totalMinutes > 0 ? `${totalMinutes} m ` : '';
      const finalTime = `${minuteString}${seconds}s`;
      return (
        <Center>
          <Container p={0} m={0}>
            <h1>Complete!</h1>
            <p>Completed in {finalTime}</p>
            <Space h="md" />
            {wrongAnswerList.length > 0 && (
              <Box>
                <h3>Wrong Answers</h3>
                <p>{wrongAnswerList.join(', ')}</p>
              </Box>
            )}
            <Group>
              <Button onClick={() => setupDrill()} variant="light" leftIcon={<IconRotate />}>
                Try again
              </Button>
              <Button onClick={() => router.push('/drills')} variant="subtle" leftIcon={<IconHome />}>
                Drills
              </Button>
            </Group>
          </Container>
        </Center>
      );
    }
  
    const getcorrectAnswerString = (questionData: DrillQuestionInterface) => {
      if (questionData?.questionType === DrillType.Reading) {
        return questionData?.questionData?.reading;
      } else if ([DrillType.Meaning, DrillType.Audio].includes(questionData?.questionType)) {
        return questionData?.questionData?.definitions.join(', ');
      }
    };
  
    const setupNewQuestion = () => {
      playQuestionAudio(MEDIA_PREFIX + questionList[0]?.questionData?.audio)
    }
  
    const playQuestionAudio = (soundUrl:string) => {
      var sound = new Howl({
        src: [soundUrl],
      });
      
      sound.play();
    }
  
    const PlayAudioButton = ({ soundUrl }: { soundUrl: string }) => {
      const [play, { sound }] = useSound(soundUrl);
    
      return (
        <ActionIcon onClick={()=>{
          play();
          // todo: set input focus
        }} radius="md" size={100}
        sx={(theme) => ({
          color: theme.colors.gray[2]
        })}
        >
          <IconPlayerPlay size={80} />
        </ActionIcon>
      );
    };
  
    const Question = (
      <Center
        style={{ backgroundColor: '#F783AC', color: 'white', textShadow: '2px 2px 4px #A61E4D' }}
      >
        {activeQuestion?.questionType === DrillType.Audio ?
        <Box style={{height: 200, display: 'flex', alignItems: 'center'}}>
         <PlayAudioButton soundUrl={MEDIA_PREFIX + activeQuestion?.questionData?.audio} />
          </Box>
        :
        <h1 style={{ fontSize: 80 }}>{activeQuestion?.questionData?.term}</h1>
        }
      </Center>
    );
  
    const Answer = (
      <Center>
        <Text style={{ fontSize: 20 }}>Correct answer: {getcorrectAnswerString(activeQuestion)}</Text>
      </Center>
    );
    return (
      <>
        <ProgressBar progress={((totalQuestions - questionList.length) / data.length) * 100} />     
        {/* <Box ml={5}>Back to Mantine website</Box> */}
        {Question}
        <Box
          sx={(theme) => ({
            paddingTop: 10,
            height: 55,
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
            color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[6],
          })}
        >
          <Center>
            <Text
              style={{
                fontSize: 24,
              }}
            >
              {activeQuestion?.questionType === DrillType.Reading ? (
                <Text inherit>
                  {'Vocabulary'}
                  <b> Reading</b>
                </Text>
              ) : (
                <Text inherit>
                  {'Vocabulary'}
                  <b> Meaning</b>
                </Text>
              )}
            </Text>
          </Center>
        </Box>
        <Box
          style={{
            marginTop: 16,
            marginBottom: 16,
            marginLeft: 32,
            marginRight: 32,
            boxShadow: '2px 2px 4px 0px #888',
          }}
        >
          <WanakanaInput
            to={activeQuestion?.questionType === DrillType.Reading ? 'kana' : 'romaji'}
            component={DrillInput}
            componentValue={inputValue}
            status={inputStatus}
            onKeyDown={handleKeyDown}
            value={inputValue}
            onChange={handleChange}
            placeholder={
              activeQuestion?.questionType === DrillType.Reading ? '答え' : 'Your Response'
            }
            autoFocus
            className={shake ? `shake` : null}
          />
        </Box>
        {inputStatus === 'incorrect' && Answer}
      </>
    );
  }
  