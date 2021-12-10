"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinalIO = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const crypt_1 = require("../utils/crypt");
let $ = require('jquery');
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
class SpinalIO {
    constructor() {
        this.loadPromise = new Map();
        this.loadedPtr = new Map();
        this.connectPromise = null;
        this.user = null;
        this.conn = null;
    }
    decriJson(encryptedHex) {
        try {
            const k = [
                10,
                95,
                124,
                68,
                55,
                24,
                90,
                57,
                34,
                65,
                81,
                22,
                75,
                7,
                110,
                1,
            ];
            const str = crypt_1.decriAes(k, encryptedHex);
            return JSON.parse(str);
        }
        catch (e) {
            const str = crypt_1.decriB64(encryptedHex);
            try {
                return JSON.parse(str);
            }
            catch (e) {
                return '';
            }
        }
    }
    getauth() {
        if (this.user !== null)
            return this.user;
        const encryptedHex = window.localStorage.getItem('spinalhome_cfg');
        this.user = this.decriJson(encryptedHex);
        return this.user;
    }
    connect() {
        if (this.connectPromise !== null) {
            return this.connectPromise;
        }
        this.connectPromise = new Promise((resolve, reject) => {
            $(document).ready(() => {
                spinal_core_connectorjs_type_1.FileSystem.CONNECTOR_TYPE = 'Browser';
                const user = this.getauth();
                console.log(user);
                if (user.username) {
                    const serverHost = window.location.origin;
                    // this.getServerConfig().then( => {
                    const host = serverHost.replace(/https?:\/\//, '');
                    this.conn = spinal_core_connectorjs_type_1.spinalCore.connect(`http://${user.username}:${user.password}@${host}/`);
                    resolve();
                    // });
                }
                else {
                    // window.location = '/html/drive/';
                    reject('Authentication Connection Error');
                }
            });
        });
        return this.connectPromise;
    }
    getModelPath() {
        const cryptedPath = getParameterByName('path');
        if (!cryptedPath)
            throw new Error('No "path" attribute found in the url');
        const k = [10, 95, 124, 68, 55, 24, 90, 57, 34, 65, 81, 22, 75, 7, 110, 1];
        try {
            const decripted = crypt_1.decriAes(k, cryptedPath);
            if (decripted[0] !== '/')
                throw 'not a path';
            return decripted;
        }
        catch (e) {
            const decripted = crypt_1.decriB64(cryptedPath);
            return this.load('/__users__/public/digital_twin/default');
        }
    }
    getModel() {
        try {
            const path = this.getModelPath();
            return this.load(path);
        }
        catch (e) {
            return this.load('/__users__/admin/Digital twin');
        }
    }
    load(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            if (this.loadPromise.has(path)) {
                return this.loadPromise.get(path);
            }
            const prom = new Promise((resolve, reject) => {
                try {
                    spinal_core_connectorjs_type_1.spinalCore.load(this.conn, path, (model) => {
                        resolve(model);
                    }, () => {
                        reject(new Error(`Load Error path: '${path}'`));
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
            this.loadPromise.set(path, prom);
            return prom;
        });
    }
    loadPtr(ptr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ptr instanceof spinal_core_connectorjs_type_1.File)
                return this.loadPtr(ptr._ptr);
            yield this.connect();
            const server_id = ptr.data.value;
            if (this.loadedPtr.has(server_id)) {
                return this.loadedPtr.get(server_id);
            }
            const prom = new Promise((resolve, reject) => {
                try {
                    this.conn.load_ptr(server_id, (model) => {
                        if (!model)
                            reject(new Error(`LoadedPtr Error server_id: '${server_id}'`));
                        else
                            resolve(model);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
            this.loadedPtr.set(server_id, prom);
            return prom;
        });
    }
}
exports.spinalIO = new SpinalIO();
var anyWin = window;
if (!anyWin.spinal) {
    anyWin.spinal = {};
}
if (!anyWin.spinal.spinalSystem) {
    anyWin.spinal.spinalSystem = exports.spinalIO;
}
//# sourceMappingURL=spinalIO.js.map