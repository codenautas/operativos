"use strict";

import {emergeAppBasOpe} from "./app-bas-ope"
import { AppBackend } from "backend-plus";

var AppBasOpe = emergeAppBasOpe(AppBackend);

new AppBasOpe().start();