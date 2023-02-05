/**
 * ReactDOM.render
 *
 * this.setState
 *
 * this.forceUpdate
 *
 * useState
 *
 * useReducer 触发更新时
 * 统一更新机制
 * 每次状态更新都会创建一个保存更新状态相关内容的对象，在render阶段的beginwork中会根据Update对象计算新state
 * */
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}
// 初始化状态机
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

/**
 * 消费Update的数据结构，类似fiber树，fiber节点上的多个Update会组成链表包含在updateQueue中
 */

export const createUpdateQueue = <Action>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<Action>;
};

export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>
) => {
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}
	return result;
};
