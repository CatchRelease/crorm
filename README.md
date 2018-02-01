# Catch&Release ORM
Catch&Release ORM is a heavily opinionated React/Redux ORM

#### Why an ORM?
The ORM should remove boilerplate and simplify immutable access.

Example:

**Old style:**
```jsx
// HeroCard.jsx

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from 'heroActions';

import HeroAvatar from 'heroAvatar';
import HeroDetails from 'heroDetails';

export class HeroCard extends React.Component {
  static propTypes = {
    heroId: PropTypes.number.isRequired,
    hero: ImmutablePropTypes.Map.isRequired,
    destroyHero: PropTypes.func.isRequired
  }
  
  render() {
    const { heroId, hero, destroyHero } = this.props;
    
    return (
      <Fragment>
        <button onClick={destroyHero(heroId)}>Destroy Hero</button>
        <HeroAvatar {...{ hero }} />
        <HeroDetails {...{ hero }} />
      </Fragment>
    ); 
  }
} 

const mapStateToProps = (state, props) => ({
  hero: state.data.getIn(['entities', 'hero', props.heroId.toString()], Immutable.Map())
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    destroyHero: actions.destroyHero
  }, dispatch);
}

export default connect(mapsStateToProps, mapDispatchToProps)(HeroCard);
```

**New Style:**
```jsx
// Hero.js
import ORM from 'crorm';
import { actions } from 'heroActions';

export class Hero extends ORM.Base({ id: null }) {
  onDestroy(hero, dispatch) {
    dispatch(actions.destroyHero(hero.id));
  }
}
```

```jsx
// HeroCard.jsx

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ORM from 'crorm';

import Hero from 'hero';

import HeroAvatar from 'heroAvatar';
import HeroDetails from 'heroDetails';

export class HeroCard extends React.Component {
  static propTypes = {
    heroId: PropTypes.number.isRequired,
    hero: PropTypes.shape({
      entity: PropTypes.object
    })
  }
  
  render() {
    const { hero } = this.props;    
    
    return (
      <Fragment>
        <button onClick={hero.destroy()}>Destroy Hero</button>
        <HeroAvatar {...{ hero }} />
        <HeroDetails {...{ hero }} />
      </Fragment>
    ); 
  }
}

const mapStateToProps = (state, props) => ({
  hero: Hero.findById(props.heroId)
});

export default connect(mapStateToProps)(HeroCard);

```

#### Expectations
* Redux data is Immutable utilizing Immutable.Record
* Data is in the JSONAPI format
* Data has been parsed using jsonapi-normalizer
* Actions are all CRUD based
* Redux Store should have a { data } reducer via combinedReducers. 

#### Setting Up
`import { ORM } from 'crorm';`

`import { store } from 'mystore';`

`ORM.Config.database = store;`

To Add Debug Output: `ORM.Config.debug = true;`

#### Create your Class
`class Animal extends ORM.Base {};`

##### Class Methods
`database()` - Get the Redux Store.

`dispatch()` - Get the Redux Store dispatch function.

`entityType()` - Get the entityType as a lowercase string. In our example this will be 'animal'.

`order()` - Get an Immutable List of ids containing the server ordering for the current entityType.

`order(true)` - Get an Immutable of the ordering for the current entityType in { entityOrder: Immutable.List } format.

`ordered()` - Get an Immutable List of ordered instances for the current entityType.

`pagination()` - Get the pagination for the current entityType. 

`pagination(true)` - Get an Immutable of the pagination for the current entityType in { pagination: Immutable.Map } format.

`findById(id)` - Get the instance matching the id for the entityType. Returns instance with empty Immutable.Map() when not found.

`all()` - Get and Immutable List for all entities of entityType.

`where(props = {})` - Get the instances where all props are matching.

`create(props = {})` - Create an instance with the passed in props. Call an onCreate method to be overridden for server save and state update.

##### Instance Methods

`Dot Access` - Props can be added or edited using '.'.

`valid()` - Override to provide instance validation, return a boolean.

`updateProps(props = {})` - Update the current values and returns a new instance with the passed in props. Calls an onUpdate to be overridden to save on the backend and update the store.

`destroy()` - Marks the current model as destroyed and returns a "destroyed" instance. Calls an onDestroy to be overridden to save on the backend and update the store.

`onCreate(instance, createProps, dispatch)` - Override to define what happens on create.

`onUpdate(instance, updateProps, dispatch)` - Override to define what happens on update.

`onDestroy(instance, dispatch)` - Override to define what happens on destroy.
