import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import cs from 'classnames'

import { Button } from 'lib/antd'
import * as oauth from 'lib/oauth'

import stripeIcon from './images/stripe.svg'
import spotifyIcon from './images/spotify.svg'

import styles from './styles.module.css'

@inject('auth')
@observer
export class AuthProviders extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    authConfig: PropTypes.object,
    authParams: PropTypes.object,
    className: PropTypes.string
  }

  static defaultProps = {
    authConfig: {},
    authParams: {}
  }

  render() {
    const {
      className,
      authConfig,
      authParams,
      auth,
      staticContext,
      ...rest
    } = this.props

    const hasGitHubAuth = authConfig.github?.enabled !== false
    const hasGoogleAuth = authConfig.google?.enabled !== false
    const hasSpotifyAuth = authConfig.spotify?.enabled !== false
    const hasTwitterAuth = authConfig.twitter?.enabled !== false
    const hasLinkedInAuth = authConfig.linkedin?.enabled !== false
    const hasStripeAuth = authConfig.stripe?.enabled !== false

    const isGitHubLinked = auth.user.providers.github?.id
    const isGoogleLinked = auth.user.providers.google?.id
    const isSpotifyLinked = auth.user.providers.spotify?.id
    const isTwitterLinked = auth.user.providers.twitter?.id
    const isLinkedInLinked = auth.user.providers.linkedin?.id
    const isStripeLinked = auth.user.providers.stripe?.id

    console.log('user', toJS(auth.user))

    return (
      <div className={cs(styles.authProviders, className)} {...rest}>
        {hasGitHubAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              icon='github'
              type={authConfig.github?.type || 'secondary'}
              onClick={this._onClickGitHub}
            >
              {isGitHubLinked ? 'Re-link GitHub' : 'Link GitHub'}
            </Button>

            {authConfig.github?.detail}
          </div>
        )}

        {hasGoogleAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              icon='google'
              type={authConfig.google?.type || 'secondary'}
              onClick={this._onClickGoogle}
            >
              {isGoogleLinked ? 'Re-link Google' : 'Link Google'}
            </Button>

            {authConfig.google?.detail}
          </div>
        )}

        {hasSpotifyAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              type={authConfig.spotify?.type || 'secondary'}
              onClick={this._onClickSpotify}
            >
              <img
                className={styles.icon}
                src={spotifyIcon}
                alt='Spotify logo'
              />

              {isSpotifyLinked ? 'Re-link Spotify' : 'Link Spotify'}
            </Button>

            {authConfig.spotify?.detail}
          </div>
        )}

        {hasLinkedInAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              icon='linkedin'
              type={authConfig.linkedin?.type || 'secondary'}
              onClick={this._onClickLinkedIn}
            >
              {isLinkedInLinked ? 'Re-link LinkedIn' : 'Link LinkedIn'}
            </Button>

            {authConfig.linkedin?.detail}
          </div>
        )}

        {hasTwitterAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              icon='twitter'
              type={authConfig.twitter?.type || 'secondary'}
              onClick={this._onClickTwitter}
            >
              {isTwitterLinked ? 'Re-link Twitter' : 'Link Twitter'}
            </Button>

            {authConfig.twitter?.detail}
          </div>
        )}

        {hasStripeAuth && (
          <div className={styles.authProvider}>
            <Button
              className={styles.authButton}
              type={authConfig.stripe?.type || 'secondary'}
              onClick={this._onClickStripe}
            >
              <img className={styles.icon} src={stripeIcon} alt='Stripe logo' />

              {isStripeLinked
                ? 'Re-link Stripe Account'
                : 'Link Stripe Account'}
            </Button>

            {authConfig.stripe?.detail}
          </div>
        )}
      </div>
    )
  }

  _onClickGitHub = (e) => {
    e.preventDefault()
    oauth.authGitHub(this.props.authParams)
  }

  _onClickGoogle = (e) => {
    e.preventDefault()
    oauth.authGoogle(this.props.authParams)
  }

  _onClickSpotify = (e) => {
    e.preventDefault()
    oauth.authSpotify(this.props.authParams)
  }

  _onClickTwitter = (e) => {
    e.preventDefault()
    oauth.authTwitter(this.props.authParams)
  }

  _onClickLinkedIn = (e) => {
    e.preventDefault()
    oauth.authLinkedIn(this.props.authParams)
  }

  _onClickStripe = (e) => {
    e.preventDefault()
    oauth.authStripe({ auth: this.props.auth }, this.props.authParams)
  }
}
