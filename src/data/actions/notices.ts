import {
  ApiError,
  ContentType,
  Notification,
} from 'thu-learn-lib-no-native/lib/types';
import {createAction, createAsyncAction} from 'typesafe-actions';
import dayjs from 'dayjs';
import {dataSource} from 'data/source';
import {ThunkResult} from 'data/types/actions';
import {
  GET_ALL_NOTICES_FOR_COURSES_FAILURE,
  GET_ALL_NOTICES_FOR_COURSES_REQUEST,
  GET_ALL_NOTICES_FOR_COURSES_SUCCESS,
  GET_NOTICES_FOR_COURSE_FAILURE,
  GET_NOTICES_FOR_COURSE_REQUEST,
  GET_NOTICES_FOR_COURSE_SUCCESS,
  SET_PIN_NOTICE,
  SET_FAV_NOTICE,
  SET_UNREAD_NOTICE,
  SET_ARCHIVE_NOTICES,
} from 'data/types/constants';
import {Notice} from 'data/types/state';

export const getNoticesForCourseAction = createAsyncAction(
  GET_NOTICES_FOR_COURSE_REQUEST,
  GET_NOTICES_FOR_COURSE_SUCCESS,
  GET_NOTICES_FOR_COURSE_FAILURE,
)<undefined, {courseId: string; notices: Notice[]}, ApiError>();

export function getNoticesForCourse(courseId: string): ThunkResult {
  return async (dispatch, getState) => {
    dispatch(getNoticesForCourseAction.request());

    try {
      const results = await dataSource.getNotificationList(courseId);
      const courseName = getState().courses.names[courseId];
      const notices = results
        .map<Notice>(result => ({
          ...result,
          courseId,
          courseName: courseName.name,
          courseTeacherName: courseName.teacherName,
        }))
        .sort(
          (a, b) => dayjs(b.publishTime).unix() - dayjs(a.publishTime).unix(),
        );
      dispatch(getNoticesForCourseAction.success({notices, courseId}));
    } catch (err) {
      dispatch(getNoticesForCourseAction.failure(err as ApiError));
    }
  };
}

export const getAllNoticesForCoursesAction = createAsyncAction(
  GET_ALL_NOTICES_FOR_COURSES_REQUEST,
  GET_ALL_NOTICES_FOR_COURSES_SUCCESS,
  GET_ALL_NOTICES_FOR_COURSES_FAILURE,
)<undefined, Notice[], ApiError>();

export function getAllNoticesForCourses(courseIds: string[]): ThunkResult {
  return async (dispatch, getState) => {
    dispatch(getAllNoticesForCoursesAction.request());

    try {
      const results = await dataSource.getAllContents(
        courseIds,
        ContentType.NOTIFICATION,
      );
      const courseNames = getState().courses.names;
      const notices = Object.keys(results)
        .map(courseId => {
          const noticesForCourse = results[courseId] as Notification[];
          const courseName = courseNames[courseId];
          return noticesForCourse.map<Notice>(notice => ({
            ...notice,
            courseId,
            courseName: courseName.name,
            courseTeacherName: courseName.teacherName,
          }));
        })
        .reduce((a, b) => a.concat(b))
        .sort(
          (a, b) => dayjs(b.publishTime).unix() - dayjs(a.publishTime).unix(),
        );
      dispatch(getAllNoticesForCoursesAction.success(notices));
    } catch (err) {
      dispatch(getAllNoticesForCoursesAction.failure(err as ApiError));
    }
  };
}

export const setPinNotice = createAction(
  SET_PIN_NOTICE,
  (noticeId: string, flag: boolean) => ({
    noticeId,
    flag,
  }),
)();

export const setFavNotice = createAction(
  SET_FAV_NOTICE,
  (noticeId: string, flag: boolean) => ({
    noticeId,
    flag,
  }),
)();

export const setUnreadNotice = createAction(
  SET_UNREAD_NOTICE,
  (noticeId: string, flag: boolean) => ({
    noticeId,
    flag,
  }),
)();

export const setArchiveNotices = createAction(
  SET_ARCHIVE_NOTICES,
  (noticeIds: string[], flag: boolean) => ({
    noticeIds,
    flag,
  }),
)();
