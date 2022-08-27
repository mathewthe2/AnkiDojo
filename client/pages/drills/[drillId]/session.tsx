import { Container } from '@mantine/core';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDrillData } from '@/hooks/drill/useDrillData';
import DrillRoom from '@/components/drill/DrillRoom';
import { DrillType } from '@/interfaces/drill/DrillType';

export default function Session() {
  const router = useRouter();
  const { drillId, type } = router.query;
  const { drill, isLoading, hasError } = useDrillData(drillId as string);

  useEffect(() => {
    if (hasError) {
      router.push('/');
    }
  }, [drill, hasError, isLoading]);

  if (hasError || isLoading) {
    return <Container></Container>;
  }

  if (drill === undefined) {
    return <Container><h1>Page not found.</h1></Container>
  }

  const drillTypes = Object.values(DrillType) as string[];
  if (!drillTypes.includes(type as string)) {
    router.push(`/drill/${drillId}`);
    return <Container></Container>
  }
  
  return <DrillRoom data={drill.data} quizType={type as DrillType} />;
}
