import Immutable from 'immutable';
import { createStore, combineReducers } from 'redux';
import { Shot } from './models';

// Setup Redux Store
export const initialState = Immutable.fromJS({
  entities: {
    shot: {
      1234: new Shot({
        id: '1234',
        projectId: '1'
      }),
      2345: new Shot({
        id: '2345',
        projectId: '1'
      }),
      3456: new Shot({
        id: '3456',
        projectId: '2'
      })
    }
  },
  entityOrder: {
    shot: {
      shot: ['2345', '3456'],
      collection_shot: ['3456', '1234']
    }
  },
  pagination: {
    shot: {
      shot: {
        previous_page: null,
        next_page: 2,
        current_page: 1,
        total_pages: 3,
        total_count: 111,
        count: 50
      },
      collection_shot: {
        previous_page: null,
        next_page: 2,
        current_page: 1,
        total_pages: 5,
        total_count: 10,
        count: 2
      }
    }
  }
});

export function updateShot(shotId, props) {
  return {
    type: 'UPDATE_SHOT',
    shotId,
    props
  };
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_SHOT':
      return state.mergeDeep({
        entities: {
          shot: {
            [action.shotId.toString()]: action.props
          }
        }
      });
    default:
      return state;
  }
}

const finalReducer = combineReducers({
  ...{
    data: reducer
  }
});

export const store = createStore(finalReducer);
