import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import {userGet, userInit} from '../utils/api';
import {showToast} from '../utils/utils';

export interface UserInputProps {
  refUserId: string;
  style: CSSProperties;
}

export default forwardRef<HTMLDivElement, UserInputProps>(
  (props: UserInputProps, ref) => {
    const {refUserId, style} = props;
    const userItemProp = ['Name', 'Gender', 'Profession', 'Age', 'Description'];

    const userData = {
      name: '',
      gender: '',
      profession: '',
      age: '',
      description: '',
    };

    const [userDataState, setUserDataState] = useState<{
      name: string;
      gender: string;
      profession: string;
      age: string;
      description: string;
    }>(userData);

    useEffect(() => {
      userGet({refUserId}).then((user) => {
        if (user) {
          setUserDataState({
            name: user.name ?? '',
            gender: user.gender ?? '',
            profession: user.profession ?? '',
            age: user.age ?? '',
            description: user.description ?? '',
          });
        }
      });
    }, []);

    const onSave = () => {
      userInit(refUserId, userDataState).then((res) => {
        if (res?.data?.code === 0) {
          showToast('Saved');
        }
      });
    };

    const userItemView = (
      index: number,
      userDataState: {
        name: string;
        gender: string;
        profession: string;
        age: string;
        description: string;
      },
    ) => {
      const height = index === 4 ? '120px' : '40px';
      const alignItems = index === 4 ? 'self-start' : 'center';
      const marginTop = index === 4 ? '10px' : '0px';
      const lineMarginTop = index === 4 ? '13px' : '0px';

      let value = '';
      if (index === 0) {
        value = userDataState.name;
      } else if (index === 1) {
        value = userDataState.gender;
      } else if (index === 2) {
        value = userDataState.profession;
      } else if (index === 3) {
        value = userDataState.age;
      } else if (index === 4) {
        value = userDataState.description;
      }

      const onChange = (e: any) => {
        if (index === 0) {
          userDataState.name = e.target.value;
        } else if (index === 1) {
          userDataState.gender = e.target.value;
        } else if (index === 2) {
          userDataState.profession = e.target.value;
        } else if (index === 3) {
          if (!isNaN(e.target.value) && e.target.value.length <= 2) {
            userDataState.age = e.target.value;
          }
        } else if (index === 4) {
          userDataState.description = e.target.value;
        }
        setUserDataState({...userDataState});
      };

      const inputView = (index: number) => {
        if (index === 4) {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                paddingBottom: '10px',
              }}
            >
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  color: '#000000',
                  outline: 'none',
                  border: 'none',
                  fontSize: '14px',
                  //@ts-ignore
                  webkitBoxShadow: 'none',
                  mozBoxShadow: 'none',
                  boxShadow: 'none',
                  overflow: 'auto',
                  resize: 'none',
                }}
                value={value}
                onChange={onChange}
              ></textarea>
            </div>
          );
        } else {
          return (
            <input
              enterKeyHint="send"
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: '10px',
                color: '#000000',
                outline: 'none',
                fontSize: '14px',
                border: 'none',
              }}
              value={value}
              onChange={(e) => {
                onChange(e);
              }}
            />
          );
        }
      };
      return (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height,
              alignItems,
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          >
            <div
              style={{
                width: '45%',
                color: '#000000',
                fontSize: '14px',
                marginTop,
              }}
            >
              {userItemProp[index]}
            </div>
            <div
              style={{
                width: '1px',
                height: '16px',
                backgroundColor: '#D8D8D8',
                marginRight: '10px',
                marginTop: lineMarginTop,
              }}
            />
            {inputView(index)}
          </div>
          {/* line */}
          {index < 4 && (
            <div
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                width: '100%',
              }}
            >
              <div
                style={{
                  height: '1px',
                  width: '100%',
                  backgroundColor: '#C4C4C4',
                }}
              ></div>
            </div>
          )}
        </>
      );
    };

    return (
      <div
        style={{
          height: '100%',
          paddingTop: '8px',
          overflow: 'scroll',
          marginLeft: '16px',
          marginRight: '16px',
          ...style,
        }}
        ref={ref}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 'bold',
              height: '40px',
              lineHeight: '40px',
              letterSpacing: '0px',
              color: '#000000',
            }}
          >
            Your Profile Settings
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                lineHeight: '30px',
                color: '#A5A5A5',
                marginTop: '13px',
                marginBottom: '13px',
              }}
            >
              ✋ Your Privacy is in your control.
            </div>
          </div>

          {userItemView(0, userDataState)}
          {userItemView(1, userDataState)}
          {userItemView(2, userDataState)}
          {userItemView(3, userDataState)}
          {userItemView(4, userDataState)}

          <div
            onClick={onSave}
            style={{
              borderRadius: '20px',
              border: '1px solid #000000',
              fontSize: '15px',
              color: '#000000',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '4px',
              paddingBottom: '5px',
              alignSelf: 'center',
              marginBottom: '15px',
              zIndex: 500,
              cursor: 'pointer',
            }}
          >
            Save
          </div>
        </div>
      </div>
    );
  },
);
