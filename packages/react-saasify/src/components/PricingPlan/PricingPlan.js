import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import theme from 'lib/theme'

import { Link } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { Divider } from 'lib/antd'

import { CTAButton } from '../CTAButton'
import { Paper } from '../Paper'

import infinity from '../../assets/infinity.svg'

import styles from './styles.module.css'

@inject('auth')
@observer
export class PricingPlan extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    plan: PropTypes.object.isRequired,
    inline: PropTypes.bool,
    className: PropTypes.string
  }

  static defaultProps = {
    inline: false
  }

  render() {
    const { auth, plan, inline, className, ...rest } = this.props

    const isCurrentPlan = auth.consumer
      ? auth.consumer.plan === plan.slug
      : auth.isAuthenticated && plan.isFree
    const isDowngrade =
      !isCurrentPlan &&
      auth.consumer &&
      auth.consumer.plan !== plan.slug &&
      plan.isFree

    const actionLink = isDowngrade ? '/dashboard' : `/signup?plan=${plan.slug}`

    return (
      <Paper className={theme(styles, 'plan', className)} {...rest}>
        <h3 className={theme(styles, 'name')}>
          {plan.name} {inline ? 'Plan' : ''}
        </h3>

        <Divider />

        <div className={theme(styles, 'features')}>
          <div />

          <div className={theme(styles, 'column')}>Price</div>

          <div className={theme(styles, 'column')}>Rate Limit</div>

          {plan.requests && (
            <Fragment>
              <div className={theme(styles, 'emphasis')}>API Calls</div>

              <div>{plan.requests.price}</div>

              {plan.requests.rateLimit || (
                <img
                  alt='unlimited'
                  src={infinity}
                  className={theme(styles, 'infinity')}
                />
              )}
            </Fragment>
          )}
        </div>

        <Divider />

        {plan.desc && (
          <div style={{ color: theme['@primary-color'] }}>{plan.desc}</div>
        )}

        <div className={theme(styles, 'price')}>
          <span className={theme(styles, 'dollas')}>{plan.price}</span> /{' '}
          {plan.interval}
        </div>

        {!inline &&
          (isCurrentPlan ? (
            <CTAButton disabled type={plan.type}>
              Current plan
            </CTAButton>
          ) : (
            <Link to={actionLink}>
              <CTAButton
                type={plan.type}
                className={cs(
                  plan.type === 'secondary' &&
                    theme(styles, 'secondaryCTAButton')
                )}
              >
                {isDowngrade
                  ? 'Downgrade'
                  : auth.consumer && auth.consumer.enabled
                  ? 'Switch plans'
                  : 'Get started'}
              </CTAButton>
            </Link>
          ))}
      </Paper>
    )
  }
}
