import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonIcon,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiHealth,
  EuiToolTip,
} from '@elastic/eui';
import { IAccountDto, ILoginState, IWebsiteLoginInfo } from '@postybirb/dto';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useToggle } from 'react-use';
import AccountApi from '../../../api/account.api';
import AccountLoginModal from '../account-login-modal/account-login-modal';
import AccountLoginWebview from '../account-login-webview/account-login-webview';
import {
  ClearAccountDataPopover,
  DeleteAccountPopover,
} from './account-table-actions';

type AccountLoginCardAccountTableProps = {
  instances: IAccountDto[];
  groups: string[];
  website: IWebsiteLoginInfo;
};

function NameColumn(props: {
  name: string;
  onNameUpdate: (name: string) => void;
}) {
  const { name, onNameUpdate } = props;
  const [isEditing, toggleEditing] = useToggle(false);
  const [editedName, setEditedName] = useState<string>(name);

  if (isEditing) {
    const isNameEditValid = !!editedName && editedName.trim().length > 0;
    return (
      <EuiFieldText
        placeholder={name}
        defaultValue={editedName}
        value={editedName}
        onChange={(event) => setEditedName(event.target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter' && isNameEditValid) {
            onNameUpdate(editedName.trim());
            toggleEditing(false);
          }
        }}
        append={
          <EuiButtonIcon
            iconType="save"
            onClick={() => {
              onNameUpdate(editedName.trim());
              toggleEditing(false);
            }}
            disabled={!isNameEditValid}
          />
        }
      />
    );
  }

  return (
    <>
      <span>{name}</span>
      <EuiToolTip
        content={<FormattedMessage id="edit" defaultMessage="Edit" />}
      >
        <EuiButtonIcon iconType="pencil" onClick={() => toggleEditing(true)} />
      </EuiToolTip>
    </>
  );
}

function GroupsColumn(props: {
  groups: string[];
  allGroups: string[];
  onGroupsUpdate: (groups: string[]) => void;
}) {
  const { groups, allGroups, onGroupsUpdate } = props;
  const [groupOptions, setGroupOptions] = useState<
    EuiComboBoxOptionOption<string>[]
  >(
    allGroups.map((group) => ({
      value: group,
      label: group,
      key: group,
    }))
  );
  const [selectedGroups, setSelectedGroups] = useState<
    EuiComboBoxOptionOption<string>[]
  >(
    groups.map((group) => ({
      value: group,
      label: group,
      key: group,
    }))
  );
  const [isEditing, toggleEditing] = useToggle(false);

  if (isEditing) {
    const onGroupCreate = (value: string) => {
      const foundTag = groupOptions.find((t) => t.value === value);
      if (foundTag) {
        setSelectedGroups([...selectedGroups, foundTag]);
      } else {
        const group = {
          label: value,
          key: value,
          value,
        };
        setGroupOptions([...groupOptions, group]);
        setSelectedGroups([...selectedGroups, group]);
      }
    };

    return (
      <>
        <EuiComboBox
          style={{ padding: '0.25em' }}
          isClearable
          options={groupOptions}
          selectedOptions={selectedGroups}
          onCreateOption={onGroupCreate}
          onChange={(values) => {
            setSelectedGroups(values);
          }}
        />
        <EuiButtonIcon
          style={{ marginLeft: '4px' }}
          iconType="save"
          onClick={() => {
            onGroupsUpdate(selectedGroups.map((g) => g.value as string));
            toggleEditing(false);
          }}
        />
      </>
    );
  }

  return (
    <span className="flex-wrap">
      {groups.map((group) => (
        <EuiBadge key={group} color="primary">
          {group}
        </EuiBadge>
      ))}
      <EuiButtonIcon
        style={{ marginLeft: '4px' }}
        iconType="pencil"
        onClick={() => toggleEditing(true)}
      />
    </span>
  );
}

function AccountLoginAction(props: {
  account: IAccountDto<unknown>;
  website: IWebsiteLoginInfo;
}) {
  const { account, website } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // TODO determine real modal type to return
  const loginMethod = (
    <AccountLoginWebview src="https://furaffinity.net" id={account.id} />
  );

  const modal = isVisible ? (
    <AccountLoginModal
      account={account}
      website={website}
      onClose={() => {
        setIsVisible(false);
        AccountApi.refreshLogin(account.id);
      }}
    >
      {loginMethod}
    </AccountLoginModal>
  ) : null;

  return (
    <>
      <EuiButton
        color="primary"
        className="mr-2"
        size="s"
        onClick={() => {
          setIsVisible(true);
        }}
      >
        <FormattedMessage id="login" defaultMessage="Login" />
      </EuiButton>
      {modal}
    </>
  );
}

function AccountActions(props: {
  account: IAccountDto<unknown>;
  website: IWebsiteLoginInfo;
}) {
  const { account, website } = props;
  const { id } = account;
  return (
    <span>
      <AccountLoginAction account={account} website={website} />
      <ClearAccountDataPopover id={id} />
      <DeleteAccountPopover id={id} />
    </span>
  );
}

export default function AccountLoginCardTable(
  props: AccountLoginCardAccountTableProps
) {
  const { instances, groups, website } = props;

  const columns: EuiBasicTableColumn<IAccountDto>[] = [
    {
      field: 'name',
      name: <FormattedMessage id="name" defaultMessage="Name" />,
      render: (name: string, record: IAccountDto<unknown>) => (
        <NameColumn
          key={name}
          name={name}
          onNameUpdate={(updatedName: string) => {
            AccountApi.update(record.id, {
              name: updatedName,
              groups: record.groups,
            });
          }}
        />
      ),
    },
    {
      field: 'loginState',
      name: <FormattedMessage id="status" defaultMessage="Status" />,
      render: (item: unknown) => {
        const { isLoggedIn, username, pending } = item as ILoginState;
        if (isLoggedIn) {
          return <EuiHealth color="success">{username}</EuiHealth>;
        }

        if (pending) {
          return (
            <EuiHealth color="primary">
              <FormattedMessage
                id="login.pending-login"
                defaultMessage="Checking..."
              />
            </EuiHealth>
          );
        }

        return (
          <EuiHealth color="danger">
            <FormattedMessage
              id="login.not-logged-in"
              defaultMessage="Not logged in"
            />
          </EuiHealth>
        );
      },
    },
    {
      field: 'groups',
      name: <FormattedMessage id="groups" defaultMessage="Groups" />,
      render: (accountGroups: string[], record: IAccountDto<unknown>) => (
        <GroupsColumn
          groups={accountGroups}
          allGroups={groups}
          onGroupsUpdate={(updatedGroups: string[]) => {
            AccountApi.update(record.id, {
              name: record.name,
              groups: updatedGroups,
            });
          }}
        />
      ),
    },
    {
      field: 'id',
      name: <FormattedMessage id="actions" defaultMessage="Actions" />,
      render: (id: string, record: IAccountDto<unknown>) => (
        <AccountActions account={record} website={website} />
      ),
    },
  ];

  if (!instances.length) {
    return null;
  }

  return <EuiBasicTable items={instances} columns={columns} />;
}
