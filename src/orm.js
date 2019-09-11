import ORMBaseBuilder from './orm/ormBase';
import ORMConfig from './orm/ormConfig';

const config = new ORMConfig();

const ORM = {
  Config: config,
  Base: ORMBaseBuilder(config)
};

export default ORM;
