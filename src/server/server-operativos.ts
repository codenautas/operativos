"use strict";

import {emergeAppOperativos} from "./app-operativos"
import { AppBackend } from "backend-plus";

var AppOperativos = emergeAppOperativos(AppBackend);

new AppOperativos().start();