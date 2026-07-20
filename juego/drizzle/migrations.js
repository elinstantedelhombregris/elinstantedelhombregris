// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_chunky_stardust.sql';
import m0001 from './0001_wandering_riptide.sql';
import m0002 from './0002_military_mockingbird.sql';
import m0003 from './0003_last_rictor.sql';
import m0004 from './0004_shocking_red_hulk.sql';
import m0005 from './0005_civic_listenings.sql';
import m0006 from './0006_territorial_missions.sql';
import m0007 from './0007_superb_doomsday.sql';
import m0008 from './0008_civic_disclosure_receipts.sql';
import m0009 from './0009_civic_need_custodies.sql';
import m0010 from './0010_civic_need_access_grants.sql';
import m0011 from './0011_civic_need_access_grant_delivery.sql';
import m0012 from './0012_civic_custody_responses.sql';
import m0013 from './0013_civic_custody_coordination.sql';
import m0014 from './0014_civic_custody_terminal_decision.sql';
import m0015 from './0015_civic_custody_response_intents.sql';
import m0016 from './0016_civic_custody_execution_intents.sql';
import m0017 from './0017_protocolo_vivo.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
    m0006,
    m0007,
    m0008,
    m0009,
    m0010,
    m0011,
    m0012,
    m0013,
    m0014,
    m0015,
    m0016,
    m0017,
  },
};
