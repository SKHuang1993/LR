
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    Navigator,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';


import { observable, action, computed, autorun, extendObservable } from 'mobx';
import { observer } from 'mobx-react/native';

import home from './home'
import account from './account'
import travelapplicate from './travelapplicate'
import common from './common'
import flights from './flights'
import booking from './booking'
import passengers from './passengers'
import components from './components'
import hotels from './hotels'
import trainChange from './trainChange'


export { account, home, travelapplicate, common, flights, booking ,passengers ,components ,hotels,trainChange }
