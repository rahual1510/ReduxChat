import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Animated, ScrollView, Modal, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Voice from '@react-native-community/voice';


import { sendMessage } from '../Actions/MessageAction'

class Chat extends Component {

    constructor(props) {
        super(props)
        this.state = {
            inputValue: "",
            send: false,
            voice: false,
            results: [],
            showAttachmentModal: false,
            micAnimateValue: new Animated.Value(0)
        }
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
    }

    startAnimation = () => {
        Animated.timing(this.state.micAnimateValue, {
            toValue: 1,
            duration: 1000,
        }).start(() => {
            Animated.timing(this.state.micAnimateValue, {
                toValue: 0,
                duration: 1000,
            }).start(() => {
                if (this.state.voice) {
                    this.startAnimation()
                }
            })
        })
    }

    changeInputText = (text) => {
        let send = false
        if (text.length) {
            send = true
        }
        this.setState({
            inputValue: text,
            send
        })
    }

    async _startRecognition(e) {
        this.setState({
            results: [],
        });
        try {
            await Voice.start('en-US');
        } catch (e) {
            console.error(e);
        }
    }

    startListening = () => {
        this.setState({ voice: true })
        this.startAnimation()
        this._startRecognition()
    }

    stopListening = () => {
        Voice.stop()
        this.setState({ voice: false })
    }

    onSpeechResults(e) {
        this.setState({
            results: e.value,
            inputValue: e.value[0],
            send: true,
            voice: false
        });
    }

    sendMessage = (type, senderId, randomCall) => {
        let data
        if (type === "text") {
            data = {
                senderId,
                msg: senderId === 2 ? "Hello everyone, I am great." : this.state.inputValue.trim()
            }
        } else if (type === "image") {
            data = {
                senderId,
                attachment: {
                    type: "image",
                    name: "nature",
                    url: senderId === 2 ? require("../Assets/Images/star.jpeg") : require("../Assets/Images/nature.jpeg")
                }
            }
        } else if (type === "doc") {
            data = {
                senderId,
                attachment: {
                    type: "doc",
                    name: senderId === 2 ? "document2.pdf" : "document1.pdf",
                }
            }
        }
        this.props.sendMessage(data);

        if (randomCall) {

            this.setState({
                showAttachmentModal: false,
                inputValue: "",
                send: false
            })
            setTimeout(() => {
                this.sendMessage(type, 2, false)
            }, 1000);
        }
    }

    componentWillUnmount() {
        Voice.destroy().then(Voice.removeAllListeners);
    }

    render() {
        const micAnimation = {
            transform: [
                {
                    scale: this.state.micAnimateValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 7],
                        extrapolate: "clamp"
                    })
                }
            ],
            backgroundColor: this.state.micAnimateValue.interpolate({
                inputRange: [0, 1],
                outputRange: ["rgba(150,203,187,0.8)", "rgba(218,34,103,0.8)"]
            })
        }
        return (
            <View style={style.container}>
                <ScrollView
                    ref={ref => { this.scrollView = ref }}
                    onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
                >
                    <View style={style.chatMessageContainer}>
                        {
                            this.props.chatMessages.messages.map((item, index) => {
                                return (
                                    <View key={index} style={item.senderId === 1 ? style.chatLeftMessageContainer : style.chatRightMessageContainer}>
                                        {
                                            item.attachment ?
                                                item.attachment.type === "image" ?
                                                    <Image
                                                        resizeMode="cover"
                                                        style={style.chatImageStyle}
                                                        source={item.attachment.url}
                                                    />
                                                    :
                                                    <View style={[style.attachItemBox, item.senderId === 1 ? style.chatLeftMessageBackgroundColor : style.chatRightMessageBackgroundColor]}>
                                                        <View style={style.attachItemBoxIcon}>
                                                            <EntypoIcon name="text-document" size={hp("3%")} color="#FFF" />
                                                        </View>
                                                        <View style={style.attachItemBoxTitle}>
                                                            <Text numberOfLines={1} style={{ color: "#FFF" }}>{item.attachment.name}</Text>
                                                        </View>
                                                    </View>
                                                :
                                                <View style={[style.chatMesssageStyle, item.senderId === 1 ? style.chatLeftMessageRoundStyle : style.chatRightMessageRoundStyle]}>
                                                    <Text style={{ color: "#FFF" }}>{item.msg}</Text>
                                                </View>
                                        }
                                    </View>
                                )
                            })
                        }
                    </View>
                </ScrollView>



                <View style={style.chatFooterContainer}>
                    {
                        this.state.voice ?
                            <View style={style.listeningContainer}>
                                <View style={style.listeningTextContainer}>
                                    <Text
                                        style={{
                                            fontSize: wp("4%"),
                                            fontWeight: "bold",
                                        }}
                                    >Listening ...</Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    style={style.listeningMicStyle}
                                    onPress={() => this.stopListening()}
                                >
                                    <FontAwesomeIcon name="microphone" size={hp("3%")} color="#808080" />
                                </TouchableOpacity>
                                <Animated.View style={[style.animatedMicStyle, micAnimation]} />
                            </View>
                            :
                            <View style={style.chatTypingContainer}>
                                <View>
                                    <TextInput
                                        multiline
                                        placeholder={"Start typing..."}
                                        style={style.typingTextConatiner}
                                        onChangeText={text => this.changeInputText(text)}
                                        value={this.state.inputValue}
                                    />
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => this.setState({ showAttachmentModal: true })}
                                    style={style.typingIconContainer}>
                                    <EntypoIcon name="attachment" size={hp("3%")} color="#808080" />
                                </TouchableOpacity>
                                {
                                    this.state.send ?
                                        <TouchableOpacity
                                            style={style.typingIconContainer}
                                            activeOpacity={0.5}
                                            onPress={() => this.sendMessage("text", 1, true)}
                                        >
                                            <Ionicons name="send" size={hp("3%")} color="#96cbbb" />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            style={style.typingIconContainer}
                                            activeOpacity={0.5}
                                            onPress={() => this.startListening()}
                                        >
                                            <FontAwesomeIcon name="microphone" size={hp("3%")} color="#808080" />
                                        </TouchableOpacity>
                                }
                            </View>
                    }
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.showAttachmentModal}
                    onRequestClose={() => {
                        this.setState({
                            showAttachmentModal: false,
                        })
                    }}
                >
                    <View style={style.modalView}>
                        <View style={style.modalOptionsContainer}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => this.sendMessage("image", 1, true)}
                                style={style.modalOptionContainer}>
                                <View style={style.modalOptionIconContainer}>
                                    <FontAwesomeIcon name="picture-o" size={hp("3%")} color="#808080" />
                                </View>
                                <View style={style.modalOptionTextContainer}>
                                    <Text style={style.modalOptionsTextStyle}>Gallery</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => this.sendMessage("doc", 1, true)}
                                style={[style.modalOptionContainer, { borderBottomWidth: 0 }]}>
                                <View style={style.modalOptionIconContainer}>
                                    <EntypoIcon name="text-document" size={hp("3%")} color="#808080" />
                                </View>
                                <View style={style.modalOptionTextContainer}>
                                    <Text style={style.modalOptionsTextStyle}>Documents</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => this.setState({ showAttachmentModal: false })}
                            style={style.cancelView}>
                            <Text style={{
                                fontWeight: "bold",
                                fontSize: wp("5%")
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        )
    }

}

const mapStateToProps = state => ({
    chatMessages: state.messages,
});

export default connect(mapStateToProps, { sendMessage })(Chat);

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8d3e2"
    },
    chatMessageContainer: {
        flex: 1,
        paddingBottom: hp("3%")
    },
    chatLeftMessageContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: hp("2%")
    },
    chatRightMessageContainer: {
        flexDirection: "row",
        marginTop: hp("2%")
    },
    chatMesssageStyle: {
        maxWidth: wp("60%"),
        backgroundColor: "#fff",
        marginHorizontal: wp("2%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1%"),
    },
    chatImageStyle: {
        maxWidth: wp("60%"),
        backgroundColor: "#fff",
        marginHorizontal: wp("2%"),
        borderRadius: hp("1%")
    },
    attachItemBox: {
        maxWidth: wp("60%"),
        borderRadius: hp("1%"),
        flexDirection: "row",
        backgroundColor: "#FFF",
        marginHorizontal: wp("2%"),
        paddingVertical: hp("1%"),
    },
    attachItemBoxIcon: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wp("2%")
    },
    attachItemBoxTitle: {
        maxWidth: wp("50%"),
        justifyContent: "center",
        paddingRight: wp("4%")
    },
    chatLeftMessageBackgroundColor: {
        backgroundColor: "#da2267"
    },
    chatLeftMessageRoundStyle: {
        borderBottomLeftRadius: hp("2%"),
        borderTopRightRadius: hp("2%"),
        backgroundColor: "#da2267"
    },
    chatRightMessageBackgroundColor: {
        backgroundColor: "#0d1239"
    },
    chatRightMessageRoundStyle: {
        borderTopLeftRadius: hp("2%"),
        borderBottomRightRadius: hp("2%"),
        backgroundColor: "#0d1239"
    },
    chatFooterContainer: {
        backgroundColor: "#96cbbb",
    },
    chatTypingContainer: {
        marginVertical: hp("1%"),
        alignSelf: "center",
        width: wp("95%"),
        borderRadius: hp("3%"),
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    typingIconContainer: {
        height: hp("6%"),
        width: wp("10%"),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-end",
    },
    typingTextConatiner: {
        minHeight: hp("5%"),
        maxHeight: hp("20%"),
        width: wp("75%"),
        padding: 0,
        paddingLeft: wp("4%"),
        paddingVertical: hp("1%"),
    },
    listeningContainer: {
        height: hp("6%"),
        flexDirection: 'row',
        overflow: "hidden"
    },
    listeningTextContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    listeningMicStyle: {
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        width: wp("12%"),
        borderTopLeftRadius: hp("2.5%"),
        borderBottomLeftRadius: hp("2.5%"),
        zIndex: 10
    },
    animatedMicStyle: {
        right: 0,
        position: "absolute",
        backgroundColor: "yellow",
        height: hp("6%"),
        width: wp("10%"),
        borderRadius: hp("5%")
    },

    modalView: {
        flex: 1,
        width: wp("100%"),
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalOptionsContainer: {
        backgroundColor: "#E8E8E8",
        width: wp("90%"),
        borderRadius: hp("1%"),
        marginBottom: hp("1%")
    },
    modalOptionContainer: {
        width: wp("90%"),
        height: hp("7%"),
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#A8A8A8"
    },
    modalOptionIconContainer: {
        flex: 0.2,
        justifyContent: "center",
        alignItems: "center"
    },
    modalOptionTextContainer: {
        flex: 0.8,
        justifyContent: "center"
    },
    modalOptionsTextStyle: {
        fontSize: wp("4.5%"),
        // fontWeight: "bold"
    },
    cancelView: {
        width: wp('90%'),
        height: hp("7%"),
        justifyContent: "center",
        borderRadius: hp("1%"),
        alignItems: "center",
        backgroundColor: "white",
        marginBottom: hp("1%")
    },
})