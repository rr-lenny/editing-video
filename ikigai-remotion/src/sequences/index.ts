import React from 'react';
import {Sequence01} from './Sequence01';
import {Sequence02} from './Sequence02';
import {Sequence03} from './Sequence03';
import {Sequence04} from './Sequence04';
import {Sequence05} from './Sequence05';
import {Sequence06} from './Sequence06';
import {Sequence07} from './Sequence07';
import {Sequence08} from './Sequence08';
import {Sequence09} from './Sequence09';
import {Sequence10} from './Sequence10';
import {Sequence11} from './Sequence11';
import {Sequence12} from './Sequence12';
import {Sequence13} from './Sequence13';
import {Sequence14} from './Sequence14';

/** Une séquence absente de ce registre est simplement ignorée. */
export const SEQUENCE_COMPONENTS: Record<string, React.FC> = {
  S01: Sequence01,
  S02: Sequence02,
  S03: Sequence03,
  S04: Sequence04,
  S05: Sequence05,
  S06: Sequence06,
  S07: Sequence07,
  S08: Sequence08,
  S09: Sequence09,
  S10: Sequence10,
  S11: Sequence11,
  S12: Sequence12,
  S13: Sequence13,
  S14: Sequence14,
};
