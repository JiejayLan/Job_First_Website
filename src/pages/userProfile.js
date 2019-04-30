import React from 'react';
import Person from '../components/user_profile/sidebar';
import Information from '../components/user_profile/content';
import Amplify, { API, graphqlOperation, I18n } from "aws-amplify";
import * as queries from '../graphql/queries';
import { getUser, isLoggedIn } from '../services/auth';
import { Layout, Skeleton, Menu, Icon } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: this.props.userID,
            loading: true,
            collapsed: false,
            theJobs: []
        }
    }

    onCollapse = (collapsed) => {
        console.log(collapsed);
        this.setState({ collapsed });
    }

    componentDidMount = async () => {
        // fetch the user info
        try {
            // console.log(this.props.userID);
            const user = await API.graphql(graphqlOperation(queries.getEmployee, { id: this.state.userID }));
            console.log(user);
            this.setState({
                user: user.data.getEmployee,
                loading: false
            })
        } catch (err) {
            console.log("From userProfile.js - error in getting the user's information", err);
        }

        // Fetch all relevant jobs and save to state to render to page
        try {
            // We can fetch an applied job by id now. But now we have to filter it by the employee id which returns results specific to the user
            let fetchAllAppliedJobs = await API.graphql(graphqlOperation(queries.getAppliedJob, { id: this.state.userID }));
            console.log("From userProfile.js - The following job was fetched:\n", fetchAllAppliedJobs.data.getAppliedJob);
            this.setState({ theJobs: [...fetchAllAppliedJobs.data.getAppliedJob] });
        } catch (err) {
            console.log("From userProfile.js - error in getting list of jobs: ", err);
        }

    }

    render() {
        if (this.state.loading) {
            return (
                <Skeleton active />
            );
        }
        //console.log(this.state.user);
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={this.onCollapse}
                    width={300}
                >
                    <Person user={this.state.user} />
                    {(getUser().sub === this.state.userID) ?(
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <SubMenu
                            key="sub1"
                            title={<span><Icon type="form" /><span>{I18n.get('Edit Profile')}</span></span>}
                        >
                            <Menu.Item key="3">
                                Modify Basic Info
                            </Menu.Item>

                            <Menu.Item key="4">
                                Update address
                            </Menu.Item>

                            <Menu.Item key="5">
                                Add Education or Award
                            </Menu.Item>
                            
                            <Menu.Item key="6">
                                Add Experience or Skill
                            </Menu.Item>
                        </SubMenu>

                        <Menu.Item key="2">
                            <Icon type="picture" />
                            <span>{I18n.get('Change Profile Picture')}</span>
                        </Menu.Item>
                        
                        <Menu.Item key="9">
                            <Icon type="file" />
                            <span>{I18n.get('Upload a Resume')}</span>
                        </Menu.Item>
                    </Menu>): null
                    }
                </Sider>
                <Content>
                    <Information user={this.state.user} jobs={this.state.theJobs} />
                </Content>
            </Layout>

        );
    }
}

export default Profile;