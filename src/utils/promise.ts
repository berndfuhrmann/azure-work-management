import { firstValueFrom, Observable } from 'rxjs';

export const observableToPromise = <T>(
	write: (value: Promise<T>) => void,
	observable: Observable<Promise<T>>,
) => {
	write(
		new Promise((res, rej) => firstValueFrom(observable).then(res).catch(rej)),
	);
	observable.subscribe((value) => write(value));
};
