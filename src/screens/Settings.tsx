import {useEffect, useState} from 'react';
import {Alert, Linking, Platform, ScrollView, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {StackActions} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import semverGt from 'semver/functions/gt';
import SafeArea from 'components/SafeArea';
import TableCell from 'components/TableCell';
import Styles from 'constants/Styles';
import {getLatestRelease} from 'helpers/update';
import {setSetting} from 'data/actions/settings';
import {clearStore} from 'data/actions/root';
import {useTypedSelector} from 'data/store';
import useDetailNavigator from 'hooks/useDetailNavigator';
import {t} from 'helpers/i18n';
import {ScreenParams} from './types';
import packageJson from '../../package.json';

const Settings: React.FC<NativeStackScreenProps<ScreenParams, 'Settings'>> = ({
  navigation,
}) => {
  const detailNavigator = useDetailNavigator();

  const dispatch = useDispatch();
  const userInfo = useTypedSelector(state => state.user);
  const username = useTypedSelector(state => state.auth.username);
  const newChangelog = useTypedSelector(
    state => state.settings.lastShowChangelogVersion !== packageJson.version,
  );
  const courseInformationSharingBadgeShown = useTypedSelector(
    state => state.settings.courseInformationSharingBadgeShown,
  );

  const [update, setUpdate] = useState<{version: string; url: string} | null>(
    null,
  );

  const handlePush = (name: keyof ScreenParams) => {
    if (detailNavigator) {
      detailNavigator.dispatch(
        StackActions.replace(name, {
          disableAnimation: true,
        }),
      );
    } else {
      navigation.push(name);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('ok'),
          onPress: () => {
            dispatch(clearStore());
          },
        },
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      (async () => {
        const {version, url} = await getLatestRelease();
        if (semverGt(version, packageJson.version)) {
          setUpdate({
            version,
            url,
          });
          dispatch(setSetting('newUpdate', true));
        }
      })();
    }
  }, [dispatch]);

  return (
    <SafeArea>
      <ScrollView style={Styles.flex1}>
        <TableCell
          imageAlt={userInfo.name ?? username ?? 'learnX'}
          primaryText={userInfo.name ?? username ?? 'learnX'}
          secondaryText={userInfo.department ?? undefined}
          type="none"
        />
        <TableCell
          iconName="person-remove"
          primaryText={t('logout')}
          type="none"
          onPress={handleLogout}
        />
        <TableCell
          style={styles.marginTop}
          iconName="date-range"
          primaryText={t('calendarsAndReminders')}
          type="arrow"
          onPress={() => handlePush('CalendarEvent')}
        />
        <TableCell
          iconName="loop"
          primaryText={t('semesterSelection')}
          type="arrow"
          onPress={() => handlePush('SemesterSelection')}
        />
        <TableCell
          iconName="rule-folder"
          primaryText={t('fileCache')}
          type="arrow"
          onPress={() => handlePush('FileCache')}
        />
        <TableCell
          style={styles.marginTop}
          iconName="grade"
          badge={!courseInformationSharingBadgeShown}
          primaryText={t('courseInformationSharing')}
          type="arrow"
          onPress={() => handlePush('CourseInformationSharing')}
        />
        <TableCell
          style={styles.marginTop}
          iconName="sticky-note-2"
          badge={newChangelog}
          primaryText={t('changelog')}
          type="arrow"
          onPress={() => handlePush('Changelog')}
        />
        {update && (
          <TableCell
            iconName="update"
            badge
            primaryText={`${t('foundNewVersion')} v${update.version}`}
            type="none"
            onPress={() => Linking.openURL(update.url)}
          />
        )}
        <TableCell
          iconName="help"
          primaryText={t('helpAndFeedback')}
          type="arrow"
          onPress={() => handlePush('Help')}
        />
        <TableCell
          iconName="copyright"
          primaryText={t('about')}
          type="arrow"
          onPress={() => handlePush('About')}
        />
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: 16,
  },
});

export default Settings;
