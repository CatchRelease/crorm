import ORMBase from './orm/ormBase';
import ORMConfig from './orm/ormConfig';

const config = new ORMConfig();

const ORM = {
  Config: config,
  Base: ORMBase
};

export default ORM;
