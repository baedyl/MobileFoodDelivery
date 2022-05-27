export const SET_USER = 'SET_USER'
export const SET_DELIVER = 'SET_DELIVER'

export const setUser = user => dispatch => {
    dispatch({
        type: SET_USER,
        payload: user
    })
}

export const setDeliver = deliver => dispatch => {
    dispatch({
        type: SET_DELIVER,
        payload: deliver
    })
}
