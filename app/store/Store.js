import React, {useReducer, createContext} from 'react';

const createDataContext = (reducer, actions, initialState) => {
  const Context = createContext();
  console.log(actions);
  const Provider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    // actions = { addBlogPost: (dispatch) => { return () => {} } }
    const boundActions = {};
    for (let key in actions) {
      boundActions[key] = actions[key](dispatch); //action[key] = add/remove methode
    }
    return (
      <Context.Provider value={{state, ...boundActions}}>
        {children}
      </Context.Provider>
    );
  };
  return {Context, Provider};
};
export default createDataContext;
