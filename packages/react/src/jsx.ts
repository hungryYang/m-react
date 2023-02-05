import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'laoyang'
	};

	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		// 摘取出key 和 ref
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 如果是config专属类型才赋值
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
		// react 的 props.children
		const maybeChildrenLength = maybeChildren.length;
		if (maybeChildrenLength) {
			if (maybeChildrenLength === 1) {
				props.children = maybeChildren[0];
			} else {
				props.children = maybeChildren;
			}
		}

		return ReactElement(type, key, ref, props);
	}
};
export const jsxDEV = (type: ElementType, config: any) => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		// 摘取出key 和 ref
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 如果是config专属类型才赋值
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
		// react 的 props.children
		return ReactElement(type, key, ref, props);
	}
};
