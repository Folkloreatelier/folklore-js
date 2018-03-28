import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import { ConnectedRouter } from 'react-router-redux';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function createRouterContainer(defaultHistory, opts) {
    const options = {
        withRef: false,
        ...opts,
    };

    const finalDefaultHistory = defaultHistory || null;

    const propTypes = {
        history: finalDefaultHistory !== null ? PropTypes.shape({
            push: PropTypes.func,
        }) : PropTypes.shape({
            push: PropTypes.func,
        }).isRequired,
    };

    const defaultProps = finalDefaultHistory !== null ? {
        history: finalDefaultHistory,
    } : {};

    return (WrappedComponent) => {
        class RouterContainer extends Component {
            static getWrappedInstance() {
                invariant(
                    options.withRef,
                    'To access the wrapped instance, you need to specify `{ withRef: true }` as the second argument of the createRouterContainer() call.',
                );
                return this.wrappedInstance;
            }

            render() {
                const props = {
                    ...this.props,
                };

                if (options.withRef) {
                    props.ref = (c) => {
                        this.wrappedInstance = c;
                    };
                }

                return (
                    <ConnectedRouter history={this.props.history}>
                        <WrappedComponent {...props} />
                    </ConnectedRouter>
                );
            }
        }

        RouterContainer.propTypes = propTypes;
        RouterContainer.defaultProps = defaultProps;
        RouterContainer.displayName = `RouterContainer(${getDisplayName(WrappedComponent)})`;
        RouterContainer.WrappedComponent = WrappedComponent;

        return hoistStatics(RouterContainer, WrappedComponent);
    };
}
