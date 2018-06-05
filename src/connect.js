import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

export function createProvider(storeKey = 'store') {
    const subscriptionKey = `${storeKey}Subscription`

    class Provider extends Component {
        getChildContext() {
            return {
                [storeKey]: this[storeKey],
                [subscriptionKey]: null
            }
        }

        constructor(props, context) {
            super(props, context)
            this[storeKey] = props.store
        }

        render() {
            return Children.only(this.props.children)
        }
    }

    Provider.childContextTypes = {
        [storeKey]: PropTypes.object.isRequired,
        [subscriptionKey]: PropTypes.string
    }

    return Provider
}

export function connect(mapStateToProps, mapDispatchToProps) {
    return function createHOC(WrappedComponent) {
        class Connect extends Component {
            constructor(props, context) {
                super(props, context)
                this.store = context.store
            }

            componentDidMount() {
                this.unsubscribe = this.store.subscribe(this.handleChange)
            }

            componentWillUnmount() {
                this.unsubscribe()
            }

            handleChange = () => {
                this.forceUpdate()
            }

            render() {
                return (
                    <WrappedComponent
                        {...this.props}
                        {...mapStateToProps(this.store.getState(), this.props)}
                        {...mapDispatchToProps(this.store.dispatch, this.props)}
                    />
                )
            }
        }

        Connect.contextTypes = {
            store: PropTypes.object.isRequired
        }

        Connect.displayName = `Connect(${WrappedComponent.name || WrappedComponent.displayName})`

        return Connect
    }
}