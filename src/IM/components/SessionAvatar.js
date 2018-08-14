
import React, { Component } from 'react';

import {

    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    Platform,

} from 'react-native';



export default class SessionAvatar extends Component
{


    getImagePath(path)
    {

        return 'http://img2.yiqifei.com'+path;
    }




    render()
    {

        const placeholder = 'http://img2.yiqifei.com/20170509/ec38ee4488a74506b6ba6f9a3fb64176.png!180';

        var count;

        var Members =[];

        var MembersCount = this.props.Members.length;


        if(MembersCount >=4)
        {
            count = 4;
        }

        else if(MembersCount >=3)
        {
            count = 3;
        }
        else if(MembersCount >=2)
        {
            count = 2;
        }
        else {

            count = 1;
        }

        for(var i=0;i<count;i++)
        {

            var Member = this.props.Members[i];

            if(Member == undefined || Member == null)
            {
                Member =placeholder;
            }
            else
            {
                Member  = this.getImagePath(Member);
            }

            Members.push(Member);
        }


        if(Platform.OS === 'android'){

            var faceurlpath = count==1 ? this.getImagePath(this.props.Members[0]) : placeholder;
           // var faceurlpath=this.getImagePath(this.props.Members[0])
            return(

                <Image style={{width:margin*2,height:margin*2,borderRadius:margin,margin:margin/2}}
                       source={{uri:faceurlpath}}>
                </Image>


            );

        }
        else {


            if(count==4) {
                return (


                    <View style={{backgroundColor:'white',borderRadius:margin,margin:margin/2}}>


                        <View style={{flexDirection:'row'}}>


                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[0])}}>
                            </Image>
                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[1])}}>
                            </Image>

                        </View>

                        <View style={{flexDirection:'row'}}>

                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[2])}}>
                            </Image>

                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[3])}}>
                            </Image>

                        </View>


                    </View>

                );
            }
            else  if(count==3)
            {

                return(


                    <View style={{backgroundColor:'white',borderRadius:margin,flexDirection:'row',margin:margin/2}}>


                        <View style={{flexDirection:'row'}}>

                            <Image style={{width:margin,height:margin*2}}
                                   source={{uri:(Members[0])}} />

                        </View>


                        <View >


                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[1])}} />

                            <Image style={styles.imageStyle}
                                   source={{uri:(Members[2])}} />

                        </View>


                    </View>

                );
            }


            else  if(count==2)
            {

                return(

                    <View style={{backgroundColor:'white',borderRadius:margin,flexDirection:'row',margin:margin/2}}>


                        <View style={{flexDirection:'row'}}>

                            <Image style={{width:margin,height:margin*2}}
                                   source={{uri:(Members[0])}} />

                        </View>

                        <View >


                            <Image style={{width:margin,height:margin*2}}
                                   source={{uri:(Members[1])}} />

                        </View>


                    </View>

                );
            }

            else
            {


                return(

                    <Image style={{width:margin*2,height:margin*2,borderRadius:margin,margin:margin/2}}
                           source={{uri:Members[0]}}>
                    </Image>


                );
            }
        }





    }

}
var margin=21;

const styles = StyleSheet.create(
    {

        imageStyle:{

            width:margin,
            height:margin,
            margin:0.5,
        },

        flex:{
            flex:1,
        },

        row:{

            flexDirection:'row',
        },

        center: {

            justifyContent: 'center',
            alignItems: 'center',

        },

    });

