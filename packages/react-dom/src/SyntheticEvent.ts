/**
 * 事件系统本质上植根于浏览器事件模型，所以他隶属于ReactDOM，在实现时要做到对 Reconciler 0侵入
 *
 * 实现事件需要考虑：
 *  - 模拟实现浏览器事件捕获、冒泡流程
 *  - 实现合成事件对象
 *  - 方便后续扩展
 *
 * 将事件回调保存在DOM中，通过以下两个时机对接：
 * 	- 创建DOM时
 * 	- 更新属性时
 * */
import { Props } from 'shared/ReactTypes';
import { Container } from './hostConfig';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];
type EventCallback = (e: Event) => void;
interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}
interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}
/**
 *
 * */
export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}
export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('当前不支持', eventType);
	}
	if (__DEV__) {
		console.log('初始化事件', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target;
	if (targetElement === null) {
		console.warn('事件不存在', e);
	}
	// 1. 收集沿途所有DOM事件回调
	const { bubble, capture } = collectPaths(
		targetElement as DOMElement,
		container,
		eventType
	);
	// 2. 构造合成事件
	const se = createSyntheticEvent(e);
	// 3. 遍历capture
	triggerEventFlow(capture, se);

	if (!se.__stopPropagation) {
		// 4. 遍历bubble
		triggerEventFlow(bubble, se);
	}
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);

		if (se.__stopPropagation) {
			break;
		}
	}
}
function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
}

function getEventCallbackNameFromEventType(
	eventType: string
): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
}

function collectPaths(
	targetElement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = {
		capture: [],
		bubble: []
	};

	while (targetElement && targetElement !== container) {
		// 收集
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							// capture
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
}
