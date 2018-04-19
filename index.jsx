// # CRORM

// Setup
// ----------------

// Import the library, your store, and any actions needed for creation, updating, and destroying.
import ORM from 'index';
import { store } from 'myStore';
import { create, update, destroy } from 'actions';

// Connect the ORM to your Redux Store. This should be done as early as possible in your application.
ORM.Config.database = store;
// `debug` can be either true or false. Setting debug to true will output message to console.log.
ORM.Config.debug = true;

// Building your Model
// ----------------

// Build your Model on top of the ORM. The object definition is the exact same as Immutable Records (https://facebook.github.io/immutable-js/docs/#/Record).
class MyModel extends ORM.Base({
  id: null,
  myAttribute1: null,
  myAttribute2: null
}) {
  // `static recordType()` **is required** and is used to look up your model in the Redux store.
  static recordType() { return 'myModel' };

  // `valid()` allows you to define a custom validator for the model. Invalid models will
  // not call the updateProps method.
  valid() {
    return !!this.projectId;
  }

  // `onCreate(model, attributes, dispatch)` is called when using the `ORM.create()` method.
  // This gets passed a copy of the immutable instance, the attributes the model was created with, and the store
  // dispatch function.
  onCreate(myModel, attributes, dispatch) {
    create(attributes);
  }

  // `onUpdate(model, attributes, dispatch)` is called when using the `ORM.updateProps()` method.
  // This gets passed a copy of the immutable instance, the attributes the model was created with, and the store
  // dispatch function.
  onUpdate(myModel, attributes, dispatch) {
    update(myModel.id, attributes);
  }

  // `onDestroy(model, dispatch)` is called when using the `ORM.updateProps()` method.
  // This gets passed a copy of the immutable instance and the store dispatch function.
  onDestroy(myModel, dispatch) {
    destroy(myModel.id);
  }
}

// Usage in Components
// ----------------

// Define your connected component as usual
export class MyComponent extends React.Component {
  static propTypes = {
    // Using PropTypes isn't required but is good practice. The `where` method returns an
    // Immutable List of our Record Types.
    models: ImmutablePropTypes.listOf(PropTypes.instanceOf(MyModel)).isRequired
  };

  render() {
    const { models } = this.props;

    return (
      models.map(model => (
        // We have direct access to the model attributes here which makes them easy to print.
        // With the addition of the onClick handler, our model will automatically update its value
        // as well as calling the `onUpdate` action to do any backend processing that might be needed.
        <a onClick={() => { model.updateProps({ attribute2: 'hasNewValue' }) }}>{model.attribute1}</a>
      )
    );
  }
}

// We do the `where` call inside the connect mapStateToProps method so that it will receive
// updates when the Redux store changes and continue to pass them down the render tree.
const mapStateToProps = (state, props) => {
  return {
    models: MyModel.where({ attribute1: 'hasThisValue' })
  }
};

export default connect(mapStateToProps)(MyComponent);

// The API
// ----------------

// Class Methods

// The `order` method returns the id order of the Models as received from the server.
// It's returned as an array by default but can be returned as immutable by passing true to the method.
MyModel.order();

// The `ordered` method returns an ordered Immutable List based upon the id order received from the server.
MyModel.ordered();

// The `pagiantion` method returns a Javascript Object that contains the pagination information returned from the server.
// It can also be returned as an Immutable by passing true to the method.
MyModel.pagination();

// The `findById` method returns a single instance of the Model Type with the data set if found or an empty version of the Model Type otherwise.
MyModel.findById(myModelsId);

// The `all` method returns an unordered Immutable List of all the Model Types in the Redux store.
MyModel.all();

// The `where` method returns an Immutable List of records where the attributes match the passed in attributes.
MyModel.where({ myAttribute1: 'myValue1' });

// The `create` method creates a new instance of the Model Type and calls the onCreate callback.
const myModel = MyModel.create({ myAttribute1: 'myValue1' });

// Instance Methods

// The `valid` method runs a check against the custom validator and returns either true or false.
const isValid = myModel.valid();

// The `updateProps` method updates the models attributes and calls the onUpdate callback.
// **The model should be updated in the store by the action/reducer.**
// The return value is the updated Immutable Model Type.
const updatedModel = myModel.updateProps({ myAttribute2: 'hasBeenUpdated' });

// The `destroy` method resets all the attributes back to their defaults and calls the onDestroy callback.
// **The model should be removed from the store in the action/reducer.**
// The return value is the cleared out Immutable Model Type.
const destroyedModel = myModel.destroy();
