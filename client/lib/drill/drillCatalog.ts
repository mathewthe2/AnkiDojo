import { DrillCatalogInterface } from '@/interfaces/drill/DrillCatalogInterface';
import { DrillType, DrillLevel } from '@/interfaces/drill/DrillType';
import { squeezeData } from './data/squeeze';
import { numberData } from './data/numbers';
import { strollData } from './data/stroll';
import { planetData } from './data/planets';
import { genkiVolume1Lesson1 } from './data/genki/volume1/lesson1';

export const drillCatalog : DrillCatalogInterface[] = [
    {
        'id': 'genkiv1l1',
        'name': 'Genki Volume 1 Lesson 1',
        'description': 'Genki Volume 1 Lesson 1',
        'data': genkiVolume1Lesson1,
        'defaultType': DrillType.ReadingAndMeaning,
        'disabledTypes': [],
        'tags': ['Genki'],
        'level': DrillLevel.Beginner,
    },
    {
        'id': 'hundreds_and_thousands',
        'name': 'Hundreds and Thousands',
        'description': 'Practice hundreds and thousands.',
        'data': numberData,
        'defaultType': DrillType.Reading,
        'disabledTypes': [],
        'tags': [],
        'level': DrillLevel.Beginner,
    },
    {
        'id': 'planets',
        'name': 'Planets',
        'description': 'Planets, including Pluto.',
        'data': planetData,
        'defaultType': DrillType.Audio,
        'disabledTypes': [],
        'tags': [],
        'level': DrillLevel.Beginner,
    },
    {
        'id': 'squeeze_or_strangle',
        'name': 'Squeeze or Strangle',
        'description': 'Practice differences between 絞る, 絞める, and 狭める.',
        'data': squeezeData,
        'defaultType': DrillType.ReadingAndMeaning,
        'disabledTypes': [DrillType.Audio],
        'tags': [],
        'level': DrillLevel.Advanced,
    },
    {
        'id': 'stroll_or_stagger',
        'name': 'Stroll or Stagger',
        'description': 'Practice differences between ふらつく, ぶらつく, and ぐらつく.',
        'data': strollData,
        'defaultType': DrillType.Meaning,
        'disabledTypes': [DrillType.Audio],
        'tags': [],
        'level': DrillLevel.Advanced,
    },
]
