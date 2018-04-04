import {EventEmitter} from 'fbemitter';
var emitter = new EventEmitter();

export function getEmitter()
{
    return emitter;
}