// @flow

import _ from 'lodash'
import React from 'react'
import { compose, graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import swal from 'sweetalert2'
import update from 'immutability-helper'

import 'sweetalert2/dist/sweetalert2.min.css'

import FlexibleContentWrapper from './FlexibleContentWrapper'
import changePasswordMutation from 'thebrain-shared/graphql/queries/changePasswordMutation'
import switchUserIsCasualMutation from 'thebrain-shared/graphql/mutations/switchUserIsCasual'
import getPasswordValidationState from '../helpers/getPasswordValidationState'
import currentUserQuery from 'thebrain-shared/graphql/queries/currentUser'
import userDetailsQuery from 'thebrain-shared/graphql/queries/userDetails'

class Profile extends React.Component {
  state = {
    oldPasswordError: '',
    confirmationError: '',
    isValid: false
  }

  goHome = () => {
    this.props.dispatch(push('/'))
  }

  submit = (e) => {
    e.preventDefault()
    this.props.submit({ oldPassword: this.refs.oldPassword.value, newPassword: this.refs.newPassword.value })
      .then((response) => {
        if (_.get(response, 'data.changePassword.success')) {
          swal('Good job!', 'Password changed successfully', 'success').then(this.goHome, this.goHome)
        } else {
          swal('Oops...', 'There was a problem while changing your password', 'error')
        }
      })
      .catch((data) => {
        const oldPasswordError = data.graphQLErrors[0].message
        this.setState({ oldPasswordError })
      })
  }

  validatePasswords = () => {
    const oldPassword = this.refs.oldPassword.value
    const newPassword = this.refs.newPassword.value
    const newPasswordConfirmation = this.refs.newPasswordConfirmation.value
    this.setState(getPasswordValidationState({ oldPassword, newPassword, newPasswordConfirmation }))
  }

  casualSwitchClick = async () => {
    await this.props.switchUserIsCasual()
    console.log('CASUAL?', this.props.userDetails.UserDetails.isCasual)
  }

  render () {
    const isGuest = this.props.currentUser ? !this.props.currentUser.CurrentUser.activated : true
    const isFacebookUser = this.props.currentUser ? this.props.currentUser.CurrentUser.facebookId : false
    const error = this.state.oldPasswordError || this.state.confirmationError
    return (
      <FlexibleContentWrapper offset={400}>
        <form className={'form'}>
          <input type='checkbox' checked={this.props.userDetails.UserDetails.isCasual}
            onChange={this.casualSwitchClick} />
          <label className={'user-casual-label'} onClick={this.casualSwitchClick}>Do not show hard questions</label>
        </form>
        { isFacebookUser || isGuest ? null
          : <form className='form' onSubmit={this.submit}>
            <div className={!error ? 'hidden' : null}>
              <p className='alert-error'>{ error }</p>
            </div>
            <div>
              <label>Old Password:</label>
              <input className={this.state.oldPasswordError ? 'error' : null} ref='oldPassword'
                type='password'
                name='oldPassword'
                onChange={this.validatePasswords}
              />
            </div>
            <div>
              <label>New Password:</label>
              <input ref='newPassword' type='password' name='newPassword' onChange={this.validatePasswords} />
            </div>
            <div>
              <label>Confirm New Password:</label>
              <input className={this.state.confirmationError ? 'error' : null} ref='newPasswordConfirmation'
                type='password'
                name='newPasswordConfirmation'
                onChange={this.validatePasswords}
              />
            </div>
            <div>
              <input type='submit' value='Change Password' disabled={!this.state.isValid || !!error} />
            </div>
          </form> }
      </FlexibleContentWrapper>
    )
  }
}

export default compose(
  connect(),
  graphql(currentUserQuery, {
    name: 'currentUser',
    options: {
      fetchPolicy: 'network-only'
    }
  }),
  graphql(userDetailsQuery, {
    name: 'userDetails',
    options: {
      fetchPolicy: 'network-only'
    }
  }),
  graphql(changePasswordMutation, {
    props: ({ mutate }) => ({
      submit: ({ oldPassword, newPassword }) => mutate({
        variables: {
          oldPassword,
          newPassword
        }
      })
    })
  }),
  graphql(switchUserIsCasualMutation, {
    props: ({ownProps, mutate}) => ({
      switchUserIsCasual: () => mutate({
        updateQueries: {
          UserDetails: (prev, {mutationResult}) => {
            return update(prev, {
              UserDetails: {
                $set: mutationResult.data.switchUserIsCasual
              }
            })
          }
        }
      })
    })
  })
)(Profile)
