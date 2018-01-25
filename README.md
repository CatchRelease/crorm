# Catch&Release ORM
Catch&Release ORM is a heavily opinionated React/Redux ORM

#### Expectations
* Data is in the JSONAPI format
* Data has been parsed using jsonapi-normalizer
* Actions are all CRUD based

#### Setting Up
`import { ORM } from 'crorm';`

`import { store } from 'mystore';`

`ORM.Config.database = store;`

#### Create your Class
`class Animal extends ORM.Base {};`

##### Class Methods
`database()` - Get the Redux Store, in { data: state } format.

`entityType()` - Get the entityType as a lowercase string. In our example this will be 'animal'.

`order()` - Get an Array of ids containing the server ordering for the current entityType.

`order(true)` - Get an Immutable of the ordering for the current entityType in { entityOrder: Immutable.List } format.

`ordered()` - Get an Array of ordered instances for the current entityType.

`pagination()` - Get the pagination for the current entityType. 

`pagination(true)` - Get an Immutable of the pagination for the current entityType in { pagination: Immutable.Map } format.

`find(id)` - Get the instance matching the id for the entityType.

`all()` - Get instances for all entities of entityType.

`where(props = {})` - Get the instances where all props are matching.

`create(props = {})` - Create an instance with the passed in props. Call an onCreate method to be overridden for server save and state update.

##### Instance Methods

`Dot Access` - Props can be added or edited using '.'.

`valid()` - Override to provide instance validation, return a boolean.

`changes()` - Returns the current changeset in the format `{ changedKey: { newValue, oldValue } }`.

`save()` - Saves the current instance. Calls an onSave to be overridden to save on the backend and update the store.

`update(props = {})` - Update the current instance with the passed in props. Calls an onUpdate to be overridden to save on the backend and update the store.

`destroy()` - Marks the current instance as destroyed. Calls an onDestroy to be overridden to save on the backend and update the store.

`onCreate()` - Override to define what happens on create.

`onSave()` - Override to define what happens on save.

`onUpdate()` - Override to define what happens on update.

`onDestroy()` - Override to define what happens on destroy.