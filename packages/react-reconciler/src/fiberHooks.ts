/**
 * 记录当前正在render的FC对应fiberNode，在fiberNode中保存hook数据
 *
 * fiberNode有一个memoizedState指向hooks的链表，
 * 链表中的每一个hook对应一个hook数据结构，hook数据结构中又有一个memoizedState保存了hook自身状态值
 */
import { Dispatch } from 'react/src/currentDispatcher';
import { Dispatcher } from 'react/src/currentDispatcher';
import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Action } from 'shared/ReactTypes';
import {
	createUpdateQueue,
	UpdateQueue,
	createUpdate,
	enqueueUpdate,
	processUpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
let currentlyRenderingFiber: FiberNode | null = null; // 记录当前正在执行的函数组件的FiberNode
let workInProgressHook: Hook | null = null; // 指向当前正在处理的hook
let currentHook: Hook | null = null; // 更新时的数据来源
const { currentDispatcher } = internals;
interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

export function renderWithHooks(wip: FiberNode) {
	console.warn('renderWithHooks');
	currentlyRenderingFiber = wip;
	// 重置 memoizedState保存的hooks链表
	wip.memoizedState = null;

	const current = wip.alertnate;

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;

	const children = Component(props);
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	return children;
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};
/**
 * 需要实现
 *  - 针对update时的dispatcher
 *  - 实现对标mountWorkInProgressHook的updateWorkInProgressHook
 *  - 实现update中计算新的state逻辑
 * */
const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function updateState<State>(): [State, Dispatch<State>] {
	// 找到当前useState对应的Hook数据
	const hook = updateWorkInProgressHook();

	// 计算新的state逻辑
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;

	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
		hook.memoizedState = memoizedState;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

/**
 * hook数据从哪来  current来
 * 交互阶段触发更新
 * render阶段触发更新
 * */
function updateWorkInProgressHook(): Hook {
	// TODO render阶段触发更新
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		// 这是这个FC update时的第一个hook
		const current = currentlyRenderingFiber?.alertnate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			// mount 错误边界情况
			nextCurrentHook = null;
		}
	} else {
		// 这个FC update时后续的hook
		nextCurrentHook = currentHook.next;
	}
	if (nextCurrentHook === null) {
		// mount/update u1 u2 u3
		// update u1 u2 u3 u4
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行的hook比上一次多`
		);
	}
	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时 第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 找到当前useState对应的Hook数据
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;
	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};

	if (workInProgressHook === null) {
		// mount时 第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
