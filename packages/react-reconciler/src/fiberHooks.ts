import { FiberNode } from './fiber';

export function renderWithHooks(wip: FiberNode) {
	console.warn('renderWithHooks');
	const Component = wip.type;
	const props = wip.pendingProps;

	const children = Component(props);
	return children;
}
